const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');
const User = require('../models/userModel');
const { constants } = require('../constants/httpStatus');
const path = require('path');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL, pass: process.env.APP_PASSWORD },
    tls: {
        rejectUnauthorized: false
    }
});

let MailGenerator = new Mailgen({
    theme: 'default',
    product: {
        name: 'Quizes',
        link: 'https://mailgen.js/'
    }
});

const registerMail = asyncHandler(async (req, res) => {
    const { userName, userEmail, text, subject } = req.body;
    var email = {
        body: {
            name: userName,
            intro:
                text ||
                "Welcome to Daily Tuition! We're very excited to have you on board.",
            outro: "Need help, or have questions? Just reply to this email, we'd love to help."
        }
    };

    var emailBody = MailGenerator.generate(email);

    let message = {
        from: ' "Verify your email" <quizeuitk16@gmail.com>',
        to: userEmail,
        subject: subject || 'Signup Successful',
        html: emailBody
    };

    transporter.sendMail(message, function (error, info) {
        if (error) {
            res.status(constants.NOT_FOUND);
            throw new Error('Send email failure');
        } else {
            res.status(constants.OK).json(
                'Verfication email is sent to your gmail account'
            );
        }
    });
});

const VerifyEmail = asyncHandler(async (req, res) => {
    try {
        const token = req.query.token;
        const user = await User.findOne({ emailToken: token });
        if (user) {
            user.emailToken = null;
            user.isVerified = true;
            await user.save();
            res.sendFile(
                path.join(__dirname, '../congratulation', 'index.html')
            );
        } else {
            res.status(constants.NOT_FOUND).json('email is not verified');
        }
    } catch (err) {
        console.log(err);
    }
});

module.exports = { transporter, MailGenerator, VerifyEmail, registerMail };
