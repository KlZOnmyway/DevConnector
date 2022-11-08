const express = require ('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User')
const bcrypt = require('bcryptjs')
const config = require('config')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator');
// @route   Get api/auth
// @desc    Test route
// @access  Public
router.get('/', auth, async (req,res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        return res.json(user);
    }catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   Get api/auth
// @desc    Authenticate user & get token
// @access  Private
router.post('/', 
    [
    body('email', 'Please provide your email').isEmail(),
    body('password', 'Password is required').exists()
    ],
    async (req, res) => {
        const error = validationResult(req);
        if(!error.isEmpty()){
            return res.status(400).json({error: error.array()});
        }
        const { email, password} = req.body;
        try{
            let user = await User.findOne({email});

            if (!user) {
                return res
                    .status(400)
                    .json({error: [{ msg: 'Invalid Credentials'}]})
            }

            //match password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res
                    .status(400)
                    .json({error: [{ msg: 'Invalid Credentials'}]}) 
            }
            //Return jsonwebtoken
            const payload = {
                user: {
                    id: user.id
                }
            }
            jwt.sign(payload, 
                config.get("jwtSecret"), 
                {expiresIn: 360000},
                (err, token) => {
                    if (err) throw err;
                    return res.json({ token });
                }
            );

        }catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
)



module.exports = router