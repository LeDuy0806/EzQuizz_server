const mongoose = require('mongoose');
const Community = require('../models/community.Model');
const Quiz = require('../models/quiz.Model');
const User = require('../models/userModel');

const getCommunities = async (req, res) => {
    const communities = await Community.find();
    const quizzes = await Quiz.find({ isPublic: true });
    const users = await User.find();

    try {
        const communitieswithQuiz = communities.map((item) => {
            let quizList = [];
            let arraylist = [...users];
            const user = arraylist.filter(
                (user) => String(user._id) === String(item.creatorId)
            );
            quizzes.map(async (quiz) => {
                if (item.quizzes.includes(quiz._id)) {
                    quizList.push(quiz);
                }
            });
            return { ...item._doc, quizList, infoCreator: user[0] };
        });
        res.status(200).json(communitieswithQuiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createCommunity = async (req, res) => {
    const { name, backgroundImage, creatorId, creatorName, tags } = req.body;

    const user = await User.findById(creatorId);
    const community = new Community({
        name,
        backgroundImage,
        quizzes: [],
        users: [],
        tags,
        creatorId,
        creatorName
    });

    try {
        await community.save();
        res.status(200).json({ ...community._doc, infoCreator: user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateCommunity = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).send(`No community with id: ${id}`);
    }

    const {} = req.body;

    const community = new Community({
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
        const updatedCommunity = await Community.findByIdAndUpdate(
            id,
            community,
            {
                new: true
            }
        );
        res.json(updatedCommunity);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deletedCommunity = async (req, res) => {
    const { id } = req.params;
    console.log(id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).send(`No community with id: ${id}`);
    }

    try {
        await Community.findByIdAndRemove(id);
        res.status(200).json({ message: 'Quiz deleted succesfully' });
        // res.status(200).json(communities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addQuizCommunity = async (req, res) => {
    const { id, quizId } = req.params;
    console.log({ id, quizId });

    const community = await Community.findById(id);
    const quiz = await Quiz.findById(quizId);
    console.log(quiz._id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).send(`No community with id: ${id}`);
    }

    try {
        if (!community.quizzes.includes(quiz._id)) {
            community.quizzes.push(quiz._id);
        }
        console.log(community);
        await community.save();
        res.status(200).json(quiz);
        // res.status(200).json(communities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteQuizCommunity = async (req, res) => {
    const { id, quizId } = req.params;
    console.log(req.params);
    console.log('Hanh phuc la gi toi khong co');

    const community = await Community.findById(id);
    const quiz = await Quiz.findById(quizId);
    // console.log(quiz._id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).send(`No community with id: ${id}`);
    }

    try {
        community.quizzes = community.quizzes.filter((item) => {
            return String(item) !== String(quizId);
        });
        await community.save();
        res.status(200).json(quiz);
        // res.status(200).json(communities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCommunities,
    createCommunity,
    updateCommunity,
    deletedCommunity,
    addQuizCommunity,
    deleteQuizCommunity
};
