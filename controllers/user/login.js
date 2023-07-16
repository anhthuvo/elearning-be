const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/user');
const HttpError = require('../../models/http-error');

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login
 *     description: token expire in 24 hour
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:      # Request body contents
 *             type: object
 *             properties:
 *               password: 
 *                  type: string
 *                  format: password
 *               email:
 *                 type: string
 *                 format: email
 *             example:   # Sample object
 *               email: admin@gmail.com
 *               password: admin@123
 *     responses:
 *          '200':
 *              description: OK
*/
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
        err && console.log(err)
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

module.exports = login
