const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { constants } = require('../constants/constants');

//generate token
const generateAccessToken = (data) => {
    return jwt.sign(data, process.env.ACCESS_TOKEN_SECERT, {
        expiresIn: process.env.EXPRISES_TIME || '10m'
    });
};
const generateRefreshToken = (data) => {
    return jwt.sign(data, process.env.REFRESH_TOKEN_SECERT, {
        expiresIn: '2d'
    });
};
//@desc Login user
//@route POST /api/auth/login
//@access public
const loginUser = asyncHandler(async (req, res) => {
    const { userName, password } = req.body;
    if (!userName || !password) {
        res.status(constants.BAD_REQUEST);
        throw new Error('All fields are mandatory!');
    }
    const user = await User.findOne({ userName });
    //compare password with hashedpassword
    if (user && (await bcrypt.compare(password + '', user.password))) {
        const accessToken = generateAccessToken({
            user: {
                userName: user.userName,
                userType: user.userType,
                email: user.email,
                id: user.id
            }
        });
        const refreshToken = generateRefreshToken({
            user: {
                userName: user.userName,
                userType: user.userType,
                email: user.email,
                id: user.id
            }
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            path: '/',
            sameSite: 'strict'
        });

        const { password, ...userWithoutPassword } = user._doc;
        res.status(constants.OK).json({
            message: 'Login successfully',
            data: { user: userWithoutPassword, accessToken, refreshToken }
        });
    } else {
        res.status(constants.UNAUTHORIZED);
        throw new Error('userName or password is not valid');
    }
});

//@desc Register a user
//@route POST /api/auth/register
//@access public
const registerUser = asyncHandler(async (req, res) => {
    // const { username, email, password } = req.body;
    const { userType, firstName, lastName, userName, email, password } =
        req.body;
    if (
        !userName ||
        !email ||
        !password ||
        !userType ||
        !firstName ||
        !lastName
    ) {
        res.status(constants.BAD_REQUEST);
        throw new Error('All fields are mandatory!');
    }
    const existingUserName = await User.findOne({ userName });
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
        return res
            .status(constants.UNPROCESSABLE_ENTITY)
            .json({ message: 'Email already exists' });
    }
    if (existingUserName) {
        return res
            .status(constants.UNPROCESSABLE_ENTITY)
            .json({ message: 'UserName already exists' });
    }
    //Hash password
    const hashedPassword = await bcrypt.hash(password + '', 10);

    try {
        const user = await User.create({
            avatar: '',
            userName,
            userType,
            fullName: lastName + ' ' + firstName,
            email,
            password: hashedPassword
        });
        // console.log(`User created ${user}`);
        if (user) {
            const accessToken = generateAccessToken({
                user: {
                    userName: user.userName,
                    userType: user.userType,
                    email: user.email,
                    id: user.id
                }
            });
            const refreshToken = generateRefreshToken({
                user: {
                    userName: user.userName,
                    userType: user.userType,
                    email: user.email,
                    id: user.id
                }
            });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: false,
                path: '/',
                sameSite: 'strict'
            });
            res.status(constants.CREATE).json({
                user,
                message: 'Register the user',
                accessToken
            });
        } else {
            res.status(constants.BAD_REQUEST);
            throw new Error('User data is not valid');
        }
    } catch (error) {
        res.status(constants.BAD_REQUEST);
        throw new Error(error);
    }
});
//@desc request refresh token
//@route POST /api/auth/refreshtoken
//@access public
const requestRefreshToken = asyncHandler(async (req, res) => {
    //take refresh token from user
    const refreshToken = req.cookies.refreshToken;
    // const refreshToken = req.body.refreshToken;
    if (!refreshToken)
        return res.status(401).json({ message: "You're not authenticated" });
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECERT,
        (err, decoded) => {
            if (err) {
                res.status(401);
                throw new Error('User is not authorized');
            }
            //create new accesstoken, refeshtoken
            const newAccessToken = generateAccessToken({ user: decoded.user });
            const newRefreshToken = generateRefreshToken({
                user: decoded.user
            });
            // store refesh token to coockie
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: false,
                path: '/',
                sameSite: 'strict'
            });
            res.status(200).json({ accessToken: newAccessToken });
        }
    );
});
//@desc Log out user
//@route POST /api/auth/logout
//@access public
const userLogout = asyncHandler(async (req, res) => {
    res.clearCookie('refreshToken');
    res.status(200).json({ message: `Logged out user id ${req.user.id}` });
});
//@desc Current user info
//@route POST /api/auth/current
//@access private
const currentUser = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

module.exports = {
    registerUser,
    loginUser,
    currentUser,
    requestRefreshToken,
    userLogout
};
