const express = require('express');

const {
    getQuizes,
    importQuiz,
    getQuizesPublics,
    createQuiz,
    getQuiz,
    updateQuiz,
    getPublicQuizes,
    getQuizesBySearch,
    getTeacherQuizes,
    deleteQuiz,
    likeQuiz,
    commentQuiz,
    addQuestion,
    getQuestions,
    getQuestion,
    updateQuestion,
    deleteQuestion
} = require('../controllers/quiz.controller');

const {
    verifyAdmin,
    verifyAccessToken
} = require('../middleware/auth.middleware');

const {
    verifyPrivateQuiz,
    verifyQuizOwner
} = require('../middleware/quiz.middleware');

const router = express.Router();

router.use(verifyAccessToken);
// router.get('/allquizzes', getQuizesPublics);
// router.get('/public', getPublicQuizes);

router.get('/public', getQuizesPublics);
router.get('/search', getQuizesBySearch);
router.get('/teacher/:teacherId', getTeacherQuizes);

router.route('/').get(verifyAdmin, getQuizes).post(createQuiz);
router.route('/import').post(importQuiz);

router
    .route('/:id')
    .get(verifyPrivateQuiz, getQuiz)
    .put(verifyQuizOwner, updateQuiz)
    .delete(verifyQuizOwner, deleteQuiz);
// router.route('/:id').get(getQuiz).put(updateQuiz);

router.get('/teacher/:teacherId', getTeacherQuizes);

router.put('/:id/likeQuiz', likeQuiz);
router.post('/:id/commentQuiz', commentQuiz);

router.route('/:quizId/questions').post(addQuestion).get(getQuestions);

router
    .route('/:quizId/questions/:questionId')
    .get(getQuestion)
    .put(updateQuestion)
    .delete(deleteQuestion);

module.exports = router;
