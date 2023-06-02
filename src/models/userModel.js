const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    avatar: {
        url: { type: String },
        ref: { type: String }
    },
    userType: {
        type: String,
        enum: ['Student', 'Teacher', 'Admin'],
        required: true
    },
    fullName: {
        type: String,
        required: true
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
    emailToken: {
        type: String
    },
    isVerified: {
        type: Boolean
    }
});

module.exports = mongoose.model('User', userSchema);
