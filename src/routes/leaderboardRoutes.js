const express = require('express');
const router = express.Router();

const {
    getHistory,
    createLeaderboard,
    deleteLeaderboard,
    getLeaderboard,
    addPlayerResult,
    updateQuestionLeaderboard,
    updateCurrentLeaderboard
} = require('../controllers/leaderboard.controller');

router.route('/history/:id').get(getHistory);
router.route('/').post(createLeaderboard);

router.route('/:leaderboardId/playerresult').patch(addPlayerResult);

router
    .route('/:leaderboardId/questionleaderboard')
    .patch(updateQuestionLeaderboard);

router
    .route('/:leaderboardId/currentleaderboard')
    .patch(updateCurrentLeaderboard);

router.route('/:id').get(getLeaderboard).delete(deleteLeaderboard);

module.exports = router;
