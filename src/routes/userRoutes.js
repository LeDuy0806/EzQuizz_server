const express = require('express');
const router = express.Router();

const {
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    unFollow,
    followUser
} = require('../controllers/user.controller');
const {
    verifyAccessToken,
    verifyAdmin,
    verifyUserAuthorization
} = require('../middleware/auth.middleware');

router.use(verifyAccessToken);
// router.route('/findfriend').get(getUsers);
router.route('/').get(getUsers);

router.route('/').get(verifyAdmin, getUsers).post(verifyAdmin, createUser);

router.route('/:myId/unfollow/:friendId').put(unFollow);
router.route('/:myId/follow/:friendId').put(followUser);

router
    .route('/:id')
    .get(getUser)
    .patch(verifyUserAuthorization, updateUser)
    .delete(verifyAdmin, deleteUser);

module.exports = router;
