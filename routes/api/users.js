const express = require ('express');
const router = express.Router();
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const { body, validationResult } = require('express-validator');
const User = require('../../models/User');

// @route   Get api/users
// @desc    Test route
// @access  Public
// router.get('/', (req,res) => res.send('User route'));
router.post('/', 
    [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please provide your email').isEmail(),
    body('password', 'Password cannot meet requirement').isLength({min : 6})
    ],
    async (req, res) => {
        const error = validationResult(req);
        if(!error.isEmpty()){
            return res.status(400).json({error: error.array()});
        }
        const {name, email, password} = req.body;
        try{
            let user = await User.findOne({email});
            if (user) {
                return res
                    .status(400)
                    .json({error: [{ msg: 'User already exist'}]})
            }

            //GET USER AVATAR
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            });

            user = new User({
                name,
                email,
                avatar,
                password
            });

            //Encrypt password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            await user.save();

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

module.exports =  router