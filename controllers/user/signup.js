const { validationResult } = require('express-validator');
const HttpError = require('../../models/http-error');
const User = require('../../models/user');
const bcrypt = require('bcryptjs');

/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     summary: Create account
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:      # Request body contents
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               password: 
 *                  type: string
 *                  format: password
 *               email:
 *                 type: string
 *                 format: email
 *             example:   # Sample object
 *               password: abc
 *               email: email@gmail.com
*/
const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError(JSON.stringify(errors), 422)
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
        err && console.error(err);
        const error = new HttpError(
            'Signing up failed, please try again.',
            500
        );
        return next(error);
    }

    res.status(201).json({ userId: createdUser.id, email: createdUser.email });
};

module.exports = signup