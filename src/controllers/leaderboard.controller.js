const mongoose = require('mongoose');
const Leaderboard = require('../models/leaderBoard.Model');
const Quiz = require('../models/quiz.Model');
const Game = require('../models/game.Model');

const getHistory = async (req, res) => {
    // const { id } = req.params;
    // console.log(req.params);
    // const games = await Game.find({});
    // console.log(games);
    const leaderboards = await Leaderboard.find();

    const games = await Game.find();
    const leaderboardWithGame = await Promise.all(
        leaderboards.map(async (leaderboard) => {
            const game = await Game.find({
                _id: leaderboard.gameId
            });
            return {
                ...leaderboard._doc,
                game
            };
        })
    );
    try {
        // const gameWithQuiz = await Promise.all(
        //     games.map(async (game) => {
        //         const quiz = await Quiz.find({
        //             _id: game.quizId
        //         });
        //         return {
        //             ...game._doc,
        //             quiz
        //         };
        //     })
        // );

        const leaderboardWithGameQuiz = await Promise.all(
            leaderboardWithGame.map(async (leaderboard) => {
                const quiz = await Quiz.find({
                    _id: leaderboard.game[0].quizId
                });
                return {
                    ...leaderboard,
                    quiz
                };
            })
        );

        res.status(200).json(leaderboardWithGameQuiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createLeaderboard = async (req, res) => {
    const { gameId, playerResultList, pin } = req.body;

    let game = await Game.findById(gameId);
    let quiz = await Quiz.findById(game.quizId);

    const leaderboard = new Leaderboard({
        gameId,
        playerResultList,
        pin
    });

    quiz.questionList.forEach((question) => {
        leaderboard.questionLeaderboard.push({
            questionIndex: question.questionIndex,
            questionResultList: []
        });
        leaderboard.currentLeaderboard.push({
            questionIndex: question.questionIndex,
            leaderboardList: []
        });
    });

    try {
        const newLeaderboard = await leaderboard.save();
        res.status(201).json(newLeaderboard);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteLeaderboard = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).send(`No leaderboard with id: ${id}`);
    }

    try {
        await Leaderboard.findByIdAndRemove(id);
        res.json({ message: 'Leaderboard deleted succesfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getLeaderboard = async (req, res) => {
    let leaderboard;
    try {
        leaderboard = await Leaderboard.findById(req.params.id);
        if (leaderboard == null) {
            return res.status(404).json({ message: 'Leaderboard not found' });
        }
        res.status(200).json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addPlayerResult = async (req, res) => {
    const { leaderboardId } = req.params;
    const { playerResultId } = req.body;
    let leaderboard;

    try {
        leaderboard = await Leaderboard.findById(leaderboardId);
        leaderboard.playerResultList.push(playerResultId);
        const newLeaderboard = await leaderboard.save();
        res.status(201).json(newLeaderboard);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateQuestionLeaderboard = async (req, res) => {
    const { leaderboardId } = req.params;
    const { questionIndex, playerId, playerPoints } = req.body;
    let leaderboard;

    try {
        leaderboard = await Leaderboard.findById(leaderboardId);
        leaderboard.questionLeaderboard[
            questionIndex - 1
        ].questionResultList.push({
            playerId,
            playerPoints
        });

        const newLeaderboard = await leaderboard.save();
        res.status(201).json(newLeaderboard);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateCurrentLeaderboard = async (req, res) => {
    const { leaderboardId } = req.params;
    const { questionIndex, playerId, playerCurrentScore } = req.body;
    let leaderboard;
    try {
        leaderboard = await Leaderboard.findById(leaderboardId);
        leaderboard.currentLeaderboard[questionIndex - 1].leaderboardList.push({
            playerId,
            playerCurrentScore
        });

        const newLeaderboard = await leaderboard.save();
        res.status(201).json(newLeaderboard);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getHistory,
    createLeaderboard,
    deleteLeaderboard,
    getLeaderboard,
    addPlayerResult,
    updateQuestionLeaderboard,
    updateCurrentLeaderboard
};
