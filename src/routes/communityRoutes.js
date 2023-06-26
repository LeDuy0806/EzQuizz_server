const express = require('express');
const router = express.Router();

const {
    getCommunities,
    createCommunity,
    updateCommunity,
    deletedCommunity,
    addQuizCommunity,
    deleteQuizCommunity
} = require('../controllers/community.controller');
const { verifyAccessToken } = require('../middleware/auth.middleware');

router.use(verifyAccessToken);
router.route('/').get(getCommunities).post(createCommunity);
router.route('/:id/quiz/:quizId').put(addQuizCommunity);
router.route('/:id/deletequiz/:quizId').put(deleteQuizCommunity);

router.route('/:id').put(updateCommunity).delete(deletedCommunity);

module.exports = router;
