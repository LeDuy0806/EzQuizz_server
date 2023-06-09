const express = require('express');
const router = express.Router();

const {
    createPlayerResult,
    getPlayerResults,
    getPlayerResult,
    updatePlayerResult,
    deletePlayerResult,
    addAnswer,
    getAnswers,
    getAnswer,
    updateAnswer,
    deleteAnswer,
    addPlayerResult
} = require('../controllers/playerResult.controller');

router.route('/').get(getPlayerResults).post(createPlayerResult);

router
    .route('/:id')
    .get(getPlayerResult)
    .patch(updatePlayerResult)
    .delete(deletePlayerResult);

// router.route('/:playerResultId/answers').patch(addAnswer).get(getAnswers);

router.route('/:playerId/results/:gameId').patch(addPlayerResult);

router
    .route('/:playerResultId/answers/:answerId')
    .get(getAnswer)
    .patch(updateAnswer)
    .delete(deleteAnswer);

module.exports = router;
