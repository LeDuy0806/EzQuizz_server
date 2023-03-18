const express = require('express');
const {
    registerUser,
    currentUser,
    loginUser,
    requestRefreshToken,
    userLogout
} = require('../controllers/auth.controller');
const { verifyAccessToken } = require('../middleware/auth.middleware');

const router = express.Router();

//register
router.post('/register', registerUser);
//login
router.post('/login', loginUser);
//refresh token
router.post('/refreshtoken', requestRefreshToken);
//log out
router.post('/logout/:id', userLogout);
// get current user
router.get('/current', verifyAccessToken, currentUser);

module.exports = router;
