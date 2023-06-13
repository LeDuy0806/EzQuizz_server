const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    avatar: {
        type: String
    },
    userType: {
        type: String,
        enum: ['Student', 'Teacher', 'Admin'],
        required: true
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    fullName: {
        type: String
    },
    userName: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 15,
        unique: true
    },
    mail: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    point: {
        type: Number
    },
    follow: {
        type: [String]
    },
    friends: {
        type: [String]
    },
    emailToken: {
        type: String
    },
    isVerified: {
        type: Boolean
    }
});

module.exports = mongoose.model('User', userSchema);
