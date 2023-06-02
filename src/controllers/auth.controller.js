const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const RefreshTokenModel = require('../models/refreshToken.Model');
const { constants } = require('../constants/httpStatus');
const crypto = require('crypto');
const { transporter, MailGenerator } = require('./mailer.controller');

//generate token
const generateAccessToken = (data) => {
    try {
        const token = jwt.sign(data, process.env.ACCESS_TOKEN_SECERT, {
            expiresIn: process.env.EXPRISES_TIME || '10m'
        });
        return token;
    } catch (error) {
        console.log(`Error in generate token + ${error}`);
        return null;
    }
};
const generateRefreshToken = (data) => {
    try {
        const token = jwt.sign(data, process.env.REFRESH_TOKEN_SECERT, {
            expiresIn: '2d'
        });
        return token;
    } catch (error) {
        console.log(`Error in generate token + ${error}`);
        return null;
    }
};

//@desc Login user
//@route POST /api/auth/login
//@access public
const loginUser = asyncHandler(async (req, res) => {
    const { userName, password } = req.body;

    if (!userName || !password) {
        // res.json('All fields are mandatory!');
        res.status(constants.BAD_REQUEST);
        throw new Error('All fields are mandatory!');
    } else {
        const user = await User.findOne({ userName });
        if (!user) {
            res.status(constants.UNAUTHORIZED);
            throw new Error('Account not exist');
        } else {
            if (user && (await bcrypt.compare(password + '', user.password))) {
                if (!user.isVerified) {
                    res.status(constants.UNAUTHORIZED);
                    throw new Error('Not Verify');
                }
                //generate token
                const accessToken = generateAccessToken({
                    user: {
                        userName: user.userName,
                        userType: user.userType,
                        email: user.mail,
                        id: user.id
                    }
                });
                const refreshToken = generateRefreshToken({
                    user: {
                        userName: user.userName,
                        userType: user.userType,
                        email: user.mail,
                        id: user.id
                    }
                });
                //store refresh token to DB
                await new RefreshTokenModel({
                    user_id: user._id,
                    token: refreshToken
                }).save();

                res.cookie('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: false,
                    path: '/',
                    sameSite: 'strict'
                });

                const { password, ...userWithoutPassword } = user._doc;
                res.status(constants.OK).json({
                    message: 'Login successfully',
                    data: {
                        user: userWithoutPassword,
                        accessToken,
                        refreshToken
                    }
                });
            } else {
                res.status(constants.UNAUTHORIZED);
                throw new Error('Wrong password');
            }
        }
    }
});
//@desc Register a user
//@route POST /api/auth/register
//@access public
const registerUser = asyncHandler(async (req, res) => {
    const {
        firstName,
        lastName,
        userType,
        fullName,
        userName,
        mail,
        password,
        confirmPassword
    } = req.body;

    if (
        !firstName ||
        !lastName ||
        !userName ||
        !mail ||
        !password ||
        !userType ||
        !confirmPassword ||
        !fullName
    ) {
        res.status(constants.BAD_REQUEST);
        throw new Error('All fields are mandatory!');
    }

    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(mail)) {
        res.status(constants.BAD_REQUEST);
        throw new Error('Wrong email');
    }

    if (userType && userType === 'Admin') {
        res.status(constants.FORBIDDEN);
        throw new Error('You do not have permission to create Admin!');
    }
    const existingUserName = await User.findOne({ userName });
    const existingEmail = await User.findOne({ mail });

    if (existingEmail) {
        res.status(constants.UNPROCESSABLE_ENTITY);
        throw new Error('Email already exists');
    }
    if (existingUserName) {
        res.status(constants.UNPROCESSABLE_ENTITY);
        throw new Error('UserName already exists');
    }
    //Hash password
    const hashedPassword = await bcrypt.hash(password + '', 10);
    try {
        const user = await User.create({
            avatar: '',
            userName,
            userType,
            fullName,
            mail,
            emailToken: crypto.randomBytes(64).toString('hex'),
            isVerified: false,
            password: hashedPassword
        });
        // console.log(`User created ${user}`);
        if (user) {
            const accessToken = generateAccessToken({
                user: {
                    userName: user.userName,
                    userType: user.userType,
                    mail: user.mail,
                    id: user.id
                }
            });
            const refreshToken = generateRefreshToken({
                user: {
                    userName: user.userName,
                    userType: user.userType,
                    mail: user.mail,
                    id: user.id
                }
            });

            await new RefreshTokenModel({
                user_id: user._id,
                token: refreshToken
            }).save();

            var emailFormat = {
                body: {
                    name: userName,
                    intro: `<h2>${user.userName}! Thanks for regist</h2>
                    <h4>Please verify your mail to continue...<a href="http://${req.headers.host}/api/auth/verify-email?token=${user.emailToken}">Verify yourt Email</a></h4>
                    `,
                    outro: "Need help, or have questions? Just reply to this email, we'd love to help."
                }
            };

            var emailBody = MailGenerator.generate(emailFormat);

            var mailOptions = {
                from: 'quizeuitk16@gmail.com',
                to: user.mail,
                subject: 'Quizes - Verify you mail',
                html: emailBody
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    res.json('Error');
                } else {
                    // res.json('Register succesfully!');
                    res.status(constants.OK).json({
                        message: 'Register succesfully!'
                    });
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
                accessToken,
                refreshToken
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

const requestRefreshToken = asyncHandler(async (req, res) => {
    //take refresh token from user
    // const refreshToken = req.cookies.refreshToken;
    const refreshToken = req.body.refreshToken;
    if (!refreshToken)
        return res
            .status(constants.UNAUTHORIZED)
            .json({ message: "You're not authenticated" });

    try {
        const refreshTokenFromDB = await RefreshTokenModel.findOne({
            token: refreshToken
        });

        if (!refreshTokenFromDB) {
            return res
                .status(constants.NOT_FOUND)
                .json({ message: 'Cannot find refresh token' });
        }

        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECERT,
            (err, decoded) => {
                if (err) {
                    res.status(401);
                    throw new Error(err);
                }

                // const user = await User.findOne({
                //     userName: userDecoded.userName
                // });
                console.log(refreshTokenFromDB.user_id.toString(), decoded);
                if (refreshTokenFromDB.user_id.toString() !== decoded.user.id) {
                    res.status(constants.NOT_FOUND);
                    throw new Error('User is not found');
                }
                //create new accesstoken, refeshtoken
                const newAccessToken = generateAccessToken({
                    user: decoded.user
                });
                // const newRefreshToken = generateRefreshToken({
                //     user: decoded.user
                // });
                // // store refesh token to coockie
                // res.cookie('refreshToken', newRefreshToken, {
                //     httpOnly: true,
                //     secure: false,
                //     path: '/',
                //     sameSite: 'strict'
                // });
                res.status(200).json({ accessToken: newAccessToken });
            }
        );
    } catch (error) {
        res.status(constants.SERVER_ERROR);
        throw new Error(error);
    }
});
//@desc Log out user
//@route POST /api/auth/logout
//@access public
const userLogout = asyncHandler(async (req, res) => {
    try {
        const user_id = req.params.id;
        const result = await RefreshTokenModel.findOneAndDelete({
            user_id: user_id
        });
        if (!result) {
            return res.status(constants.BAD_REQUEST).json({
                message: `User with id ${user_id} has been logged out `
            });
        }
        res.status(constants.OK).json({
            message: `Logged out user id ${user_id}`
        });
    } catch (error) {
        res.status(constants.SERVER_ERROR);
        throw new Error(error);
    }
});
//@desc Current user info
//@route POST /api/auth/current
//@access private
const currentUser = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

const resetPassword = asyncHandler(async (req, res) => {
    const { mail, password, confirm } = req.body;
    if (password !== confirm) {
        res.status(constants.BAD_REQUEST);
        throw new Error('Invalid confirm');
    } else {
        const user = await User.findOne({ mail });
        if (user) {
            const hasedNewpass = await bcrypt.hash(password, 10);
            if (hasedNewpass) {
                await User.findOneAndUpdate(
                    { mail: user.mail },
                    { password: hasedNewpass }
                );
                res.status(constants.OK).json('Change Password successfully!');
            } else {
                res.status(constants.SERVER_ERROR);
                throw new Error('Enable to hashed password');
            }
        } else {
            res.status(constants.NOT_FOUND);
            throw new Error('email not Found');
        }
    }
});

module.exports = {
    registerUser,
    loginUser,
    currentUser,
    requestRefreshToken,
    userLogout,
    resetPassword
};
