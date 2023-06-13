const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const verifyEmail = async (req, res, next) => {
    try {
        const user = await User.findOne({ userName: req.body.userName });
        if (user) {
            if (user.isVerified) {
                next();
            } else {
                res.json({
                    message: 'Please check your email to verify  your acount'
                });
            }
        } else {
            res.json({
                message: 'Your account or password not exists'
            });
        }
    } catch (error) {
        console.log(error);
    }
};

module.exports = { verifyEmail };
