const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
    {
        creatorId: { type: mongoose.SchemaTypes.ObjectId, ref: 'users' },
        // quizId: { type: mongoose.SchemaTypes.ObjectId, ref: 'quizzes' },
        tags: [String],
        questionType: {
            type: String,
            enum: ['True/False', 'Quiz'],
            required: true
        },
        isPublic: {
            type: Boolean,
            default: true
        },
        pointType: {
            type: String,
            enum: ['Standard', 'Double', 'BasedOnTime'],
            required: true
        },
        answerTime: {
            type: Number,
            min: 5,
            max: 90
        },
        backgroundImage: {
            url: { type: String },
            ref: { type: String }
        },
        question: {
            type: String,
            required: true
        },
        answerList: [
            {
                name: { type: String },
                body: { type: String },
                isCorrect: { type: Boolean }
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Question', questionSchema);
