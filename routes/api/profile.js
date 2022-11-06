const express = require ('express');
const {body, validationResult} = require('express-validator');
// const { request } = require('express');
const Profile = require('../../models/Profile');
const router = express.Router();
const auth = require('../../middleware/Auth')
const User = require('../../models/User');
const config = require('config');
const request = require("request");

// @route   Get api/profile/me
// @desc    Test route
// @access  Public
router.get('/me', auth, async (req,res) =>{
    try
    {
        const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({msg: 'There is no profile'})
        }

        res.json(profile);
    }
    catch (err) 
    {
        console.log(err.message);
        res.status(500).send('Server error');
    }
});


// @route   Get api/profile/user/:user_id
// @desc    Get user by user id
// @access  Public
router.get('/user/:user_id', async(req, res) => {
    try{
        const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({msg: 'There is no profile for this user'})
        }
        res.json(profile)
    } catch (err) {
        console.log(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({msg: 'There is no profile for this user'})
        }
        res.status(500).send('Server error');
    }
})

// @route   Delete api/profile/
// @desc    Delete route
// @access  Public
router.delete('/', [auth], async (req, res) => {
    try{
        await Profile.findOneAndRemove({user : req.user.id});
        await User.findOneAndDelete({_id: req.user.id});
        res.json({msg: "User delete"});
    } catch (err) {
        console.log (err.message);
        res.status(500).send("There is no profile for this user");
    }     
})


// @route    GET api/profile
// @desc     Get all profiles
// @access   Public
router.get('/', async (req, res) => {
    try {
      const profiles = await Profile.find().populate('user', ['name', 'avatar']);
      res.json(profiles);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

// @route   post api/profile/
// @desc    Post profile
// @access  Public
router.post('/', [ auth, [
        body('company', 'Please enter your company').not().isEmpty(),
        body('location', 'Please enter your location').not().isEmpty(),
        body('status', 'Status is required').not().isEmpty(),
        body('skills', 'Skills is required').not().isEmpty(),
    ]
    ], 
    async (req, res) => {
        try
        {
            const error = validationResult(req);
            if (!error) {
                return res.status(400).json({error : error.array()});
            }

            const {company, status, location,  skills, website, bio, githubusername, linkedin, instagram} = req.body;
            const profileFields = {};
            profileFields.user = req.user.id;
            if(company) profileFields.company = company;
            if(location)  profileFields.location = location;
            if(status)  profileFields.status = status;
            if(skills)  profileFields.skills = skills.split(',').map(skill => skill.trim());
            if(website) profileFields.website = website;
            if(bio) profileFields.bio = bio;
            if(githubusername) profileFields.githubusername = githubusername;

            profileFields.social = {};
            if(linkedin)  profileFields.social.linkedin = linkedin;
            if(instagram) profileFields.social.instagram = instagram;
            
            let profile = await Profile.findOne({user : req.user.id});
            if (profile) {
                Profile.findOneAndUpdate(
                    {user : req.user.id},
                    profileFields,
                    {new: true}
                )

                return res.json(profile);
            }

            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile);
        }
        catch (err) {
            console.log(err.message);
            return res.status(500).send('Server error');
        }
    }
)


// @route   Get api/profile/experience
// @desc    Post route
// @access  Public
router.put("/experience", [auth, [
    body('title', 'Please enter your job titile').not().isEmpty(),
    body('company', 'Please enter your company name').not().isEmpty(),
    body('location', 'Please enter your work location').not().isEmpty(),
    body('from', 'Please enter your start time').isDate(),
    body('current', 'Please enter your current status').not().isBoolean(),
]], async (req, res) => {
    const error = validationResult(req);
    if (!error) {
        return res.status(400).json({error : error.array()});
    }
    const {title, company, location, from, to, current, description} = req.body;

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }
    
    try{
        const profile = await Profile.findOne({user : req.user.id});
        profile.experience.unshift(newExp);
        await profile.save();

        res.json(profile);
    } catch (err) {
        return res.status(500).send('Server error');
    }
})

// @route   delete api/profile/experience/:exp_id
// @desc    delete experience
// @access  Public
router.delete('/experience/:exp_id', [auth], async (req, res) => {
    try {
        const profile = await Profile.findOne({user : req.user.id})
        const removeindex = profile.experience.map(index => index.id).indexOf(req.params.exp_id)
        profile.experience.splice(removeindex, 1)
        
        await profile.save()
        res.json(profile)
    } catch (err) {
        console.log(err.message)
        return res.status(500).send('Server error');

    }
    
})


// @route   Get api/profile/education
// @desc    Post education
// @access  Public
router.put('/education', [auth, [
    body('school').not().isEmpty(),
    body('from', 'Please enter your start date').isDate(),
    ]], 
    async (req, res) => {
    
        const error = await validationResult(req)
        if (!error) {
            return res.status(400).send({error: error.array()})
        }

        const {school, from, to, degree} = req.body;
        const newEdu = {
            school,
            from,
            to,
            degree
        }
    try {
        const profile = await Profile.findOne({user : req.user.id})
        profile.education.unshift(newEdu)
        await profile.save()
        res.json(profile)

    } catch (err) {
        return res.status(500).send('Server error')
    }
})


// @route   delete api/profile/education/:edu_id
// @desc    delete education
// @access  Public
router.delete('/education/:edu_id', [auth], async (req, res) => {
    try {
        const profile = await Profile.findOne({user : req.user.id})
        const removeindex = profile.experience.map(index => index.id).indexOf(req.params.edu_id)
        profile.education.splice(removeindex, 1)
        
        await profile.save()
        res.json(profile)
    } catch (err) {
        console.log(err.message)
        return res.status(500).send('Server error');

    }
})

// @route   get api/profile/github/:username
// @desc    get github repo
// @access  Public

router.get("/github/:username", async (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&
            sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=
            ${config.get('githubSecret')}}`,
            method: 'GET',
            hearders: {'user-agent' : 'node.js'}
        };

        request(options, (error, response, body) => {
            if(error) console.error(error);

            if(response.statusCode != 200){
                res.status(404).send({msg : "github repo not found"})
            }
        })
    } catch (err) {
        console.error (err.message)
        res.status(500).send("Server error")
    }
})
module.exports = router