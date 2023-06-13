const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
    {
        creatorId: { type: mongoose.SchemaTypes.ObjectId, ref: 'users' },
        quizId: { type: mongoose.SchemaTypes.ObjectId, ref: 'quizzes' },
        tags: [String],
        questionType: {
            type: String,
            enum: ['True/False', 'Quiz'],
            required: true
        },
        optionQuestion: {
            type: String,
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
            type: String
        },
        question: {
            type: String
            // required: true
        },
        answerList: [
            {
                name: { type: String },
                body: { type: String },
                isCorrect: { type: Boolean }
            }
        ],
        questionIndex: { type: Number, required: true },
        maxCorrectAnswer: { type: Number, required: true },
        correctAnswerCount: { type: Number, required: true },
        answerCorrect: { type: [String], required: true }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Question', questionSchema);
