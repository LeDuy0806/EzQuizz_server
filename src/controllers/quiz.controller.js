const mongoose = require('mongoose');
const { constants } = require('../constants/httpStatus');
const asyncHandler = require('express-async-handler');
const Quiz = require('../models/quiz.Model');
const Question = require('../models/question.Model');
const User = require('../models/userModel');
const { request } = require('http');

const createQuiz = asyncHandler(async (req, res) => {
    const {
        name,
        backgroundImage,
        description,
        creatorName,
        pointsPerQuestion,
        isPublic,
        tags,
        likesCount,
        questionList
    } = req.body;

    const existQuizName = await Quiz.findOne({ name, creatorName });

    if (existQuizName) {
        return res.status(422).json('Quiz already exists');
    }

    if (!name || !description || !creatorName || !pointsPerQuestion || !tags) {
        return res.status(404).json('All fields are mandatory!');
    }

    const quiz = new Quiz({
        name,
        backgroundImage,
        description,
        creatorId: req.user.id,
        creatorName,
        pointsPerQuestion,
        numberOfQuestions: questionList.length,
        isPublic,
        tags,
        likesCount,
        questionList,
        dateCreated: new Date().toISOString()
    });

    try {
        const newQuiz = await quiz.save();
        if (newQuiz.questionList.length) {
            newQuiz.questionList.map((item) => {
                const handleAddQuestion = async () => {
                    const newQuestion = new Question({
                        _id: item._id,
                        creatorId: req.user.id,
                        optionQuestion: item.optionQuestion,
                        quizId: newQuiz._id,
                        questionIndex: item.questionIndex,
                        tags: item.tags,
                        isPublic: true,
                        questionType: item.questionType,
                        pointType: item.pointType,
                        answerTime: item.answerTime,
                        backgroundImage: item.backgroundImage,
                        question: item.question,
                        answerList: item.answerList,
                        maxCorrectAnswer: item.maxCorrectAnswer,
                        correctAnswerCount: item.correctAnswerCount,
                        answerCorrect: item.answerCorrect
                    });

                    await newQuestion.save();
                };
                handleAddQuestion();
            });
        }
        res.status(201).json(newQuiz);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
});

const importQuiz = asyncHandler(async (req, res) => {
    const { quizData, userId } = req.body;

    const {
        name,
        backgroundImage,
        description,
        creatorName,
        pointsPerQuestion,
        numberOfQuestions,
        isPublic,
        tags,
        likesCount,
        questionList,
        creatorId
    } = quizData;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(404).send(`No user with id: ${id}`);
    }

    const user = await User.findById(userId);

    const existQuizName = await Quiz.findOne({ name, creatorId: userId });
    if (existQuizName) {
        return res.status(422).json('Quiz already exists');
    }

    const quiz = new Quiz({
        name,
        backgroundImage,
        description,
        creatorId: userId,
        creatorName: user.userName,
        sourceCreator: creatorName,
        pointsPerQuestion,
        numberOfQuestions,
        isPublic,
        tags,
        importFrom: creatorId,
        likesCount,
        questionList,
        dateCreated: new Date().toISOString()
    });

    try {
        const newQuiz = await quiz.save();
        res.status(201).json(newQuiz);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error.message });
    }
});

const updateQuiz = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).send(`No quiz with id: ${id}`);
    }

    const {
        name,
        backgroundImage,
        description,
        pointsPerQuestion,
        isPublic,
        tags,
        questionList
    } = req.body;

    const quiz = new Quiz({
        _id: id,
        name,
        backgroundImage,
        description,
        pointsPerQuestion,
        numberOfQuestions: questionList.length,
        isPublic,
        tags,
        questionList,
        dateCreated: new Date().toISOString()
    });

    try {
        const updatedQuiz = await Quiz.findByIdAndUpdate(id, quiz, {
            new: true
        });
        res.json(updatedQuiz);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

const getQuizes = asyncHandler(async (req, res) => {
    try {
        const quizes = await Quiz.find();
        res.status(constants.OK).send(quizes);
    } catch (error) {
        res.status(constants.SERVER_ERROR);
        throw new Error(error);
    }
});

const getQuizesPublics = asyncHandler(async (req, res) => {
    try {
        const quizes = await Quiz.find({ isPublic: true });
        res.status(constants.OK).send(quizes);
    } catch (error) {
        res.status(constants.SERVER_ERROR);
        throw new Error(error);
    }
});

const getPublicQuizes = async (req, res) => {
    const { page } = req.query;
    try {
        const LIMIT = 6;
        const startIndex = (Number(page) - 1) * LIMIT; // get the starting index of every page

        const total = await Quiz.find({ isPublic: true }).countDocuments({});
        const quizes = await Quiz.find({ isPublic: true })
            .sort({ _id: -1 }) // sort from the newest
            .limit(LIMIT)
            .skip(startIndex); // skip first <startIndex> quizes
        // const quizes = await Quiz.find({ isPublic: true })
        res.status(200).send({
            data: quizes,
            currentPage: Number(page),
            numberOfPages: Math.ceil(total / LIMIT)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTeacherQuizes = asyncHandler(async (req, res) => {
    let teacherId = req.params.teacherId;
    try {
        const quizes = await Quiz.find({ creatorId: teacherId });
        res.status(200).send(quizes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const getQuiz = asyncHandler(async (req, res) => {
    let quiz;
    try {
        quiz = await Quiz.findById(req.params.id);
        if (quiz == null) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.status(200).json(quiz);
    } catch (error) {
        res.status(500);
        throw new Error(error);
    }
});

const deleteQuiz = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).send(`No quiz with id: ${id}`);
    }

    try {
        const quiz = await Quiz.findById(id);
        if (!quiz.sourceCreator) {
            const handleRemoveQuestion = async () => {
                quiz.questionList.map((item) => {
                    const handleDelete = async () => {
                        await Question.findByIdAndRemove(item._id);
                    };
                    handleDelete();
                });
            };
            handleRemoveQuestion();
        }

        await Quiz.findByIdAndRemove(id);

        res.json({ message: 'Quiz deleted succesfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const likeQuiz = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).send(`No quiz with id: ${id}`);
    }

    try {
        const quiz = await Quiz.findById(id);
        const index = quiz.likesCount.findIndex(
            (id) => id === String(req.user.id)
        );
        if (index === -1) {
            quiz.likesCount.push(req.user.id);
        } else {
            quiz.likesCount = quiz.likesCount.filter(
                (id) => id !== String(req.user.id)
            );
        }
        const updatedQuiz = await Quiz.findByIdAndUpdate(id, quiz, {
            new: true
        });
        res.json(updatedQuiz);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

const getQuizesBySearch = asyncHandler(async (req, res) => {
    const { searchQuery, tags } = req.query;

    try {
        //i -> ignore case, like ii, Ii, II
        const name = new RegExp(searchQuery, 'i');

        const quizes = await Quiz.find({
            isPublic: true,
            $or: [{ name }, { tags: { $in: tags.split(',') } }]
        });

        res.status(200).send(quizes);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

const commentQuiz = async (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;

    try {
        const quiz = await Quiz.findById(id);
        quiz.comments.push(comment);
        const updatedQuiz = await Quiz.findByIdAndUpdate(id, quiz, {
            new: true
        });
        res.status(200).send(updatedQuiz);
    } catch (e) {
        res.status(400).json({ message: error.message });
    }
};

const addQuestion = async (req, res) => {
    const { quizId } = req.params;
    const {
        backgroundImage,
        optionQuestion,
        questionType,
        question,
        pointType,
        answerTime,
        answerList,
        questionIndex,
        maxCorrectAnswer,
        correctAnswerCount,
        answerCorrect
    } = req.body;

    const newQuestion = new Question({
        creatorId: req.user.id,
        optionQuestion,
        quizId,
        questionIndex,
        tags: '',
        isPublic: true,
        questionType,
        pointType,
        answerTime,
        backgroundImage,
        question,
        answerList,
        maxCorrectAnswer,
        correctAnswerCount,
        answerCorrect
    });
    let quiz;
    try {
        const Question = await newQuestion.save();
        quiz = await Quiz.findById(quizId);
        if (quiz == null) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        quiz.questionList.push(Question);
        quiz.numberOfQuestions += 1;
        await quiz.save();

        return res.status(201).json({ Question, quiz });
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ message: error.message });
    }
};

const getQuestions = async (req, res) => {
    const { quizId } = req.params;
    try {
        const quiz = await Quiz.findById(quizId);
        if (quiz == null) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.status(200).send(quiz.questionList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getQuestion = async (req, res) => {
    const { quizId, questionId } = req.params;
    try {
        const quiz = await Quiz.findById(quizId);
        if (quiz == null) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        const question = quiz.questionList.id(questionId);
        res.json(question);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteQuestion = async (req, res) => {
    const { quizId, questionId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
        return res.status(404).send(`No quiz with id: ${quizId}`);
    }
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
        return res.status(404).send(`No question with id: ${questionId}`);
    }

    const question = await Question.findById(questionId);
    const Index = question.questionIndex;
    const quiz = await Quiz.findById(quizId);
    quiz.numberOfQuestions -= 1;

    quiz.questionList = quiz.questionList.filter(
        (item) => String(item._id) !== questionId
    );

    quiz.questionList.map((item) => {
        if (item.questionIndex > Index) {
            item.questionIndex--;
            const handleSetIndex = async () => {
                const question = await Question.findById(item._id);
                question.questionIndex -= 1;
                question.save();
            };
            handleSetIndex();
        }
    });

    await quiz.save();

    try {
        await Question.findByIdAndRemove(questionId);
        res.status(200).json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateQuestion = async (req, res) => {
    const { quizId, questionId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(quizId)) {
        return res.status(404).send(`No quiz with id: ${quizId}`);
    }
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
        return res.status(404).send(`No question with id: ${questionId}`);
    }

    const {
        questionType,
        isPublic,
        optionQuestion,
        backgroundImage,
        question,
        pointType,
        answerTime,
        answerList,
        tags,
        questionIndex,
        maxCorrectAnswer,
        correctAnswerCount,
        answerCorrect
    } = req.body;

    const newQuestion = new Question({
        _id: questionId,
        creatorId: req.user.id,
        optionQuestion,
        quizId,
        questionIndex,
        tags,
        isPublic,
        questionType,
        pointType,
        answerTime,
        backgroundImage,
        question,
        answerList,
        maxCorrectAnswer,
        correctAnswerCount,
        answerCorrect
    });

    const quiz = await Quiz.findById(quizId);

    try {
        if (quiz == null) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        await Question.findByIdAndUpdate(questionId, newQuestion, {
            new: true
        });

        let questionIndex = quiz.questionList.findIndex(
            (obj) => obj._id == questionId
        );
        quiz.questionList[questionIndex] = {
            _id: questionId,
            creatorId: req.user.id,
            optionQuestion,
            quizId,
            questionIndex: questionIndex + 1,
            tags,
            isPublic,
            questionType,
            pointType,
            answerTime,
            backgroundImage,
            question,
            answerList,
            maxCorrectAnswer,
            correctAnswerCount,
            answerCorrect
        };
        const updatedQuiz = await Quiz.findByIdAndUpdate(quizId, quiz, {
            new: true
        });
        res.status(200).json(updatedQuiz);
    } catch (error) {
        console.log(error.message);
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createQuiz,
    importQuiz,
    getQuizes,
    getQuizesPublics,
    getPublicQuizes,
    getTeacherQuizes,
    getQuizesBySearch,
    getQuiz,
    deleteQuiz,
    updateQuiz,
    addQuestion,
    getQuestions,
    getQuestion,
    updateQuestion,
    deleteQuestion,
    likeQuiz,
    commentQuiz
};
