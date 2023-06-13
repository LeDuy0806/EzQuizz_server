const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
    {
        name: { type: String },
        description: { type: String },
        backgroundImage: {
            type: String
        },
        creatorId: { type: mongoose.SchemaTypes.ObjectId, ref: 'users' },
        creatorName: { type: String },
        pointsPerQuestion: {
            type: Number,
            min: 1
        },
        numberOfQuestions: {
            type: Number,
            default: 0
        },
        isPublic: { type: Boolean, required: true, default: true },
        tags: [String],
        importFrom: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'users'
        },
        sourceCreator: { type: String },
        likesCount: { type: [String], default: [] },
        comments: { type: [String], default: [] },
        dateCreated: { type: Date, default: new Date() },
        questionList: [
            {
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
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Quiz', quizSchema);
