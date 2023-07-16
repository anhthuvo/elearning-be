const User = require('../../models/user');
const HttpError = require('../../models/http-error');

/**
 * @swagger
 * /api/users/{uid}:
 *   get:
 *     summary: Get user information
 *     description: Only admin token or auth user token can access.
 *     produces:
 *         - application/json
 *     parameters: 
 *         - in: path
 *           name: uid
 *           required: true
 *           description: user ID
 *           default: 6162c6420e172b1985d95e51
 *     security: 
 *         - bearerAuth: []
*/
const getUser = async (req, res, next) => {
    let existingUser;
    let registeredCourses;
    try {
        if (req.userData.role !== 'AD' && req.userData.userId !== req.params.uid) throw "";
        existingUser = await User.findOne({ _id: req.params.uid }, '-password').populate('courses', '-source');
        if (!existingUser) next(new HttpError(
            'User does not exist',
            400
        ))

        const regs = await Registration.find({ userId: existingUser._id });
        registeredCourses = regs;

    } catch (err) {
        const error = new HttpError(
            'Fetching users failed, please try again later.',
            500
        );
        return next(error);
    }
    res.json({...existingUser._doc, registeredCourses});
};

module.exports = getUser
