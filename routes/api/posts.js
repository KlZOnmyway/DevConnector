const express = require ('express');
const router = express.Router();
const {body, validationResult} =  require('express-validator');
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const User = require('../../models/User')
const Profile = require('../../models/Profile')

// @route   Post api/posts
// @desc    Creat a post
// @access  Private
router.post('/', [auth, [
    body('text', 'Text is required').not().isEmpty()
]], async (req,res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({msg : errors.array()})
    }

    try {
        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        })
        

        const post = await newPost.save();

        res.json(post);
    } catch (err) {
        return res.status(500).send("Server error")
    }
});

// @route   Get api/posts
// @desc    get a post
// @access  Private
router.get('/', [auth], async (req, res) => {
    try {
        const post = await Post.find().sort({date : -1});
        res.json(post)
    } catch (err) {
        return res.status(500).send("Sever error")
    }
})

// @route   get api/posts/:post_id
// @desc    get a post
// @access  Private
router.get('/:post_id', [auth], async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id)
        if (!post) {
            return res.status(404).json({msg : "post not found"})
        }
        res.json(post)

    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({msg : "post not found"})
        }
        return res.status(500).send("Sever error")
    }
})

// @route   delete api/posts/:post_id
// @desc    delete a post
// @access  Private
router.delete('/:post_id', [auth], async (req, res) => {
    try {
       const post = await Post.findById(req.params.post_id);
       if (!post) {
        return res.status(404).json({msg : "post not found"})
        }
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({msg : "User not authorized"})
        }
        await post.remove();

        res.json({msg : "post removed"})
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({msg : "post not found"})
        }
        return res.status(500).send("Sever error")
    }
})

// @route   get api/posts/like/:post_id
// @desc    like a post
// @access  private

router.put("/like/:post_id", [auth], async(req, res) => {
    try {
        const post = await Post.findById(req.params.post_id)
        if (!post) {
            return res.status(404).json({msg : "post not found"})
        }
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({msg : "Post already liked"})
        }
        post.likes.unshift({user: req.user.id})
        await post.save();

        res.json(post.likes)
    } catch (err) {
        return res.status(500).send("Server error")
    }
    
})

// @route   delete api/posts/like/:post_id
// @desc    cancel like a post
// @access  private

router.put("/unlike/:post_id", [auth], async(req, res) => {
    try {
        const post = await Post.findById(req.params.post_id)
        if (!post) {
            return res.status(404).json({msg : "post not found"})
        }

        if (post.likes.filter(like => like.user.toString() === req.user.id).length == 0) {
            return res.status(400).json({msg : "Post hasn't been liked"})
        }
        const cancelId = post.likes.map(index => index.user).indexOf(req.user.id)
        post.likes.splice(cancelId, 1)

        await post.save();

        res.json(post.likes)
    } catch (err) {
        return res.status(500).send("Server error")
    }
    
})

// @route   post api/posts/conment
// @desc    post a comment
// @access  private

router.post("/comment/:post_id", [auth, [
    body("text", "text is required").not().isEmpty()
]], async(req, res) => {
    const error = validationResult(req)
    if (!error.isEmpty()) {
        return res.status(400).json({msg : "Comment cannot be empty"})
    }
    try {
        const post = await Post.findById(req.params.post_id)
        const user = await User.findById(req.user.id).select('-password')
        if (!post) {
            return res.status(404).json({msg : "post not found"})
        }

        const newcomment = {
            text : req.body.text,
            avatar : user.avatar,
            user : req.user.id,
            name : user.name,
        }
        
        post.comments.unshift(newcomment);

        await post.save();

        res.json(post.comments)
    } catch (err) {
        return res.status(500).send("Server error")
    }
    
})

// @route   delete api/posts/comment/:post_id/:comment_id
// @desc    delete a comment
// @access  Private
router.delete('/comment/:post_id/:comment_id', [auth], async (req, res) => {
    try {
       const post = await Post.findById(req.params.post_id);
       if (!post) {
        return res.status(404).json({msg : "post not found"})
        }

        comment = post.comments.find(comment => comment.id === req.params.comment_id);
        if (!comment) {
            return res.status(404).json({msg : "Comment not found"})
        }

        if(comment.user.toString() !== req.user.id) {
            return res.status(401).json({msg : "User not authorized"})
        }
        
        const removeIndex = post.comments.map(comment => comment.id).indexOf(req.params.comment_id);
        post.comments.splice(removeIndex, 1);
        await post.save();

        res.json(post.comments)
    } catch (err) {
        return res.status(500).send("Sever error")
    }
})


module.exports = router