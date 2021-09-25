const User = require('../models/user');
const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const getUser = async (req, res, next) => {
    let existingUser;
    try {
        if (req.userData.role !== 'HV' && req.userData.userId !== req.params.uid) throw "";
        existingUser = await User.findOne({ _id: req.params.uid }, '-password')
        if (!existingUser) throw "";
    } catch (err) {
        const error = new HttpError(
            'Fetching users failed, please try again later.',
            500
        );
        return next(error);
    }
    res.json(existingUser);
};

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, please check your data.', 422)
        );
    }

    let existingUser
    try {
        existingUser = await User.findOne({ email: req.body.email }, '-password')
    } catch (err) {
        const error = new HttpError(
            'Signing up failed, please try again later.',
            500
        );
        return next(error);
    }

    if (existingUser) {
        const error = new HttpError(
            'User exists already, please login instead.',
            400
        );
        return next(error);
    }

    let createdUser;
    try {
        const hashedPass = await bcrypt.hash(req.body.password, 12);
        createdUser = new User({ ...req.body, password: hashedPass });
        await createdUser.save();
    } catch (err) {
        console.error(err);
        const error = new HttpError(
            'Signing up failed, please try again.',
            500
        );
        return next(error);
    }

    res.status(201).json({ userId: createdUser.id, email: createdUser.email });
};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        const error = new HttpError(
            'Logging in failed, please try again later - 1',
            500
        );
        return next(error);
    }

    if (!existingUser) {
        const error = new HttpError(
            'Invalid credentials, could not log you in.',
            401
        );
        return next(error);
    }

    let isValidPass = false;
    try {
        isValidPass = await bcrypt.compare(password, existingUser.password);
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            'Logging in failed, please try again later. - 2',
            500
        );
        return next(error);
    }

    if (isValidPass !== true) {
        const error = new HttpError(
            'Invalid credentials, could not log you in.',
            401
        );
        return next(error);
    }

    let token = "";
    try {
        token = jwt.sign({ userId: existingUser.id, email: existingUser.email, role: existingUser.role }, 'xanhduong', { expiresIn: '8h' })
    }
    catch (err) {
        const error = new HttpError(
            'Logging in failed, please try again later. - 3',
            500
        );
        return next(error);
    }

    res.status(200).json({ userId: existingUser.id, email: existingUser.email, token });
};

const updateAvatar = async (req, res, next) => {
    let existingUser;
    let updatedUser;
    let avatar;
    try {
        if (req.userData.role !== 'HV' && req.userData.userId !== req.params.uid) throw "";
        existingUser = await User.findOne({ _id: req.params.uid }, '-password')
        if (!existingUser) throw "";

        const path = req.file.path.replace(/\\/g, "/");
        updatedUser = await User.findOneAndUpdate({ _id: req.params.uid }, { avatar: path }, { new: true });
        avatar = updatedUser.avatar;
    } catch (err) {
        const error = new HttpError(
            'Failed to update avatar',
            500
        );
        return next(error);
    }

    try {
        const oldPath = existingUser.avatar;
        fs.unlink(oldPath, (err) => console.log(err));
    }
    finally {
        res.json({avatar});
    }
};

const updateUser = async (req, res, next) => {
    let existingUser;
    let updatedUser;
    try {
        if (req.userData.role !== 'HV' && req.userData.userId !== req.params.uid) throw "";
        existingUser = await User.findOne({ _id: req.params.uid })
    }
    catch (err) {
        const error = new HttpError(
            'Failed to update user information',
            500
        );
        return next(error);
    }

    if (!existingUser) {
        return next(new HttpError(
            'No user exist with this id ' + req.params.uid,
            404
        ));
    }

    try {
        if (req.body.firstname) existingUser.firstname = req.body.firstname;
        if (req.body.lastname) existingUser.lastname = req.body.lastname;
        if (req.body.phone) existingUser.phone = req.body.phone;
        updatedUser = await existingUser.save();
    } catch (err) {
        const error = new HttpError(
            'Failed to update user information',
            500
        );
        return next(error);
    }

    res.json(updatedUser);
};

const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password');
    } catch (err) {
        const error = new HttpError(
            'Fetching users failed, please try again later.',
            500
        );
        return next(error);
    }
    res.json({ users: users.map(user => user.toObject({ getters: true })) });
};

module.exports = {
    signup,
    getUsers,
    login,
    updateAvatar,
    updateUser,
    getUser
}