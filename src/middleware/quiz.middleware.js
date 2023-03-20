const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const Quiz = require('../models/quiz.Model');
const { constants } = require('../constants/httpStatus');

const verifyQuizOwner = asyncHandler(async (req, res, next) => {
    let token;
    let authHeader = req.headers.Authorization || req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
        token = authHeader.split(' ')[1];

        if (!token) {
            res.status(constants.UNAUTHORIZED);
            throw new Error('User is not authorized or token is missing');
        }
        //jwt verify
        jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECERT,
            async (err, decoded) => {
                if (err) {
                    if (err.name == 'TokenExpiredError') {
                        res.status(constants.UNAUTHORIZED);
                        throw new Error('Token expired');
                    }
                    res.status(constants.UNAUTHORIZED);
                    throw new Error('User is not authorized');
                }
                const user = decoded.user;
                if (user.userType == 'Admin') {
                    next();
                }

                const quizId = req.params.id;
                try {
                    const quiz = await Quiz.findById(quizId);

                    if (!quiz) {
                        return res.status(constants.NOT_FOUND).json({
                            message: `Quiz with id ${quizId} is not found`
                        });
                    }

                    if (user.id !== quiz.creatorId?.toString()) {
                        return res.status(constants.FORBIDDEN).json({
                            message: `You are not the owner`
                        });
                    }
                } catch (error) {
                    // res.status(constants.SERVER_ERROR);
                    // throw new Error(error);
                }
                next();
            }
        );
    }
});

const verifyPrivateQuiz = asyncHandler(async (req, res, next) => {
    let token;
    let authHeader = req.headers.Authorization || req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer')) {
        token = authHeader.split(' ')[1];

        if (!token) {
            res.status(constants.UNAUTHORIZED);
            throw new Error('User is not authorized or token is missing');
        }
        //jwt verify
        jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECERT,
            async (err, decoded) => {
                if (err) {
                    if (err.name == 'TokenExpiredError') {
                        res.status(constants.UNAUTHORIZED);
                        throw new Error('Token expired');
                    }
                    res.status(constants.UNAUTHORIZED);
                    throw new Error('User is not authorized');
                }
                const user = decoded.user;
                if (user.userType == 'Admin') {
                    next();
                }

                const quizId = req.params.id;
                try {
                    let quiz = await Quiz.findById(req.params.id);
                    if (!quiz) {
                        return res.status(constants.NOT_FOUND).json({
                            message: `Quiz with id ${quizId} is not found`
                        });
                    }

                    if (
                        user.id !== quiz.creatorId?.toString() &&
                        !quiz.isPublic
                    ) {
                        res.status(constants.FORBIDDEN).json({
                            message: `You can not access this quiz ${quizId}`
                        });
                    }
                } catch (error) {
                    // res.status(constants.SERVER_ERROR);
                    // throw new Error(error);
                }
                next();
            }
        );
    }
});

module.exports = { verifyQuizOwner, verifyPrivateQuiz };
