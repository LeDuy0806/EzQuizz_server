const express = require('express');
const {
    registerUser,
    currentUser,
    loginUser,
    requestRefreshToken,
    userLogout,
    resetPassword
} = require('../controllers/auth.controller');

const {
    verifyAccessToken,
    localVariables,
    verifyUser
} = require('../middleware/auth.middleware');

const { generateOTP, verifyOTP } = require('../controllers/otp.controller');
const {
    VerifyEmail,
    registerMail
} = require('../controllers/mailer.controller');
const router = express.Router();

router.post('/register', registerUser);
router.post('/registerMail', registerMail); // send the email

//login
router.post('/login', loginUser);
//refresh token
router.post('/refreshtoken', requestRefreshToken);
//log out
router.post('/logout/:id', userLogout);
// get current user
router.get('/current', verifyAccessToken, currentUser);
// //get verify-mail;
router.get('/verify-email', VerifyEmail);

router.get('/generateOTP', verifyUser, localVariables, generateOTP); // generate random OTP
router.get('/verifyOTP', verifyUser, verifyOTP); // verify generated OTP
router.put('/resetPassword', verifyUser, resetPassword); // use to reset password

module.exports = router;
