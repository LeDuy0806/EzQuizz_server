const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
    backgroundImage: {
        type: String
    },
    name: {
        type: String,
        required: true
    },
    quizzes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Quiz'
    },
    tags: {
        type: String
    },
    users: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User'
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId
    },
    creatorName: {
        type: String
    },
    chatBox: {
        type: [Object]
    }
});

module.exports = mongoose.model('Community', communitySchema);
