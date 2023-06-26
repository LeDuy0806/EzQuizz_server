const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const { constants } = require('../constants/httpStatus');

//@desc get all users
//@route GET /api/users/
//@access private and admin role
const getUsers = asyncHandler(async (req, res) => {
    try {
        const users = await User.find();
        let newUsers = users.map((user) => {
            delete user._doc.password;
            return user;
        });
        res.status(constants.OK).send(newUsers);
    } catch (error) {
        res.status(constants.BAD_REQUEST).json({ message: error.message });
    }
});

//@desc create a new user
//@route POST /api/users/
//@access private and admin role
const createUser = asyncHandler(async (req, res) => {
    const { userType, userName, fullName, email, password } = req.body;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({
        userType,
        fullName,
        userName,
        email,
        password: hashedPassword
    });

    try {
        const newUser = await user.save();
        res.status(constants.CREATE).json(newUser);
    } catch (error) {
        res.status(constants.BAD_REQUEST).json({ message: error.message });
    }
});

//@desc get a user with id
//@route GET /api/users/:id
//@access private
const getUser = asyncHandler(async (req, res) => {
    let user;
    try {
        user = await User.findById(req.params.id);
        if (user == null) {
            return res
                .status(constants.NOT_FOUND)
                .json({ message: 'User not found' });
        }
        delete user._doc.password;
        res.json(user);
    } catch (error) {
        res.status(constants.SERVER_ERROR).json({ message: error.message });
    }
});
//@desc update a user with id
//@route POST /api/users/:id
//@access private
// const updateUser = asyncHandler(async (req, res) => {
//     const { id } = req.params;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//         return res.status(404).send(`No user with id: ${id}`);
//     }
//     // if (!req.user?.checkMySelf) {
//     //     return res.status(constants.OK).json({ message: 'not myself' });
//     // }
//     // return res.status(constants.OK).json({ message: 'myself' });
//     let oldUser;
//     try {
//         oldUser = await User.findById(req.params.id);
//         if (oldUser == null) {
//             return res
//                 .status(constants.NOT_FOUND)
//                 .json({ message: 'User not found' });
//         }
//     } catch (error) {
//         res.status(constants.SERVER_ERROR).json({ message: error.message });
//     }

//     const { avatar, userType, fullName, userName, email, password } = req.body;

//     if (userType && userType == 'Admin' && req.user.userType !== 'Admin') {
//         res.status(constants.FORBIDDEN);
//         throw new Error('Admin is not a user type!');
//     }

//     const user = new User({
//         _id: id,
//         avatar,
//         userType: userType || oldUser.userType,
//         fullName,
//         userName,
//         email: email || oldUser.email,
//         password: password || oldUser.password
//     });

//     try {
//         const updatedUser = await User.findByIdAndUpdate(id, user, {
//             new: true
//         });

//         delete updateUser._doc.password;
//         res.send(updatedUser);
//     } catch (error) {
//         res.status(constants.BAD_REQUEST).json({ message: error.message });
//     }
// });
//@desc delete a user with id
//@route DELETE /api/users/:id
//@access private and admin role

const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    console.log(id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).send(`No user with id: ${id}`);
    }
    // let oldUser;
    // try {
    //     oldUser = await User.findById(id);
    //     if (oldUser == null) {
    //         return res
    //             .status(constants.NOT_FOUND)
    //             .json({ message: 'User not found' });
    //     }
    // } catch (error) {
    //     res.status(constants.SERVER_ERROR).json({ message: error.message });
    // }

    const { avatar, firstName, lastName, userName, mail } = req.body;
    const user = new User({
        _id: id,
        avatar,
        firstName,
        lastName,
        userName,
        mail: mail
    });

    try {
        const updatedUser = await User.findByIdAndUpdate(id, user, {
            new: true
        });

        // delete updateUser._doc.password;
        return res.status(200).json(updatedUser);
    } catch (error) {
        console.log(error);
        res.status(constants.BAD_REQUEST).json({ message: error.message });
    }
});

const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id) || !User.findById(id)) {
        // return
        res.status(constants.NOT_FOUND);
        // .json({ message: `No user with id: ${id}` });
        throw new Error(`No user with id: ${id}`);
    }
    return res
        .status(constants.OK)
        .json({ message: `Delete user with id : ${id}` });
    try {
        await User.findByIdAndRemove(id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const unFollow = asyncHandler(async (req, res) => {
    const { myId, friendId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(myId) || !User.findById(myId)) {
        // return
        res.status(constants.NOT_FOUND).json({
            message: `No user with id: ${id}`
        });
        throw new Error(`No user with id: ${id}`);
    }

    if (
        !mongoose.Types.ObjectId.isValid(friendId) ||
        !User.findById(friendId)
    ) {
        // return
        res.status(constants.NOT_FOUND).json({
            message: `No user with id: ${id}`
        });
        // throw new Error(`No user with id: ${id}`);
    }
    try {
        const user = await User.findById(myId);
        const friend = await User.findById(friendId);

        user.follow = user.follow.filter((item) => item !== friend.userName);
        await user.save();
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

const followUser = asyncHandler(async (req, res) => {
    const { myId, friendId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(myId) || !User.findById(myId)) {
        res.status(constants.NOT_FOUND).json({
            message: `No user with id: ${id}`
        });
        throw new Error(`No user with id: ${id}`);
    }

    if (
        !mongoose.Types.ObjectId.isValid(friendId) ||
        !User.findById(friendId)
    ) {
        // return
        res.status(constants.NOT_FOUND).json({
            message: `No user with id: ${id}`
        });
        // throw new Error(`No user with id: ${id}`);
    }
    try {
        const user = await User.findById(myId);
        const friend = await User.findById(friendId);

        // user.friends = user.friends.
        // filter((item) => item !== friend.userName);
        user.follow.push(friend.userName);
        await user.save();

        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = {
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    unFollow,
    followUser
};
