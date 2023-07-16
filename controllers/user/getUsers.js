const User = require('../../models/user');
const HttpError = require('../../models/http-error');

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Retrieve a list of users by page and role
 *     description: Only admin token can access.
 *     produces:
 *         - application/json
 *     parameters: 
 *         - in: query
 *           name: page
 *           type: integer
 *           required: true
 *           default: 0
 *           description: The page number
 *         - in: query
 *           name: limit
 *           default: 0
 *           type: integer
 *           required: true
 *           description: Maximum item per page. if limit=0 total item will be returned
 *         - in: query
 *           name: role
 *           default: "HV"
 *           type: string
 *           description: roles of user include GV, HV, AD
 *           enum: [ HV, GV, AD]
 *     security: 
 *         - bearerAuth: [] 
 *     responses:
 *          '200':
 *              description: OK
*/
const getUsers = async (req, res, next) => {
    let users;
    let result;
    let totalUser;
    try {
        const page = parseInt(req.query.page);
        const num_limit = parseInt(req.query.limit);
        const role = req.query.role && req.query.role.toUpperCase() ;

        if (page < 0 || num_limit < 0) throw '';
        const skip_item_num = (page - 1) * num_limit;

        if (role) {
            users = await User.find({ role }, '-password').skip(skip_item_num).limit(num_limit);
            totalUser = await User.find({ role }).count();
        }
        else {
            users = await User.find({}, '-password').skip(skip_item_num).limit(num_limit);
            totalUser = await User.find({}).count();
        }

        result = {
            users: users.map(user => user.toObject({ getters: true })),
            total_page: Math.ceil(totalUser / num_limit),
            current_page: page,
            role: role,
            total_user: totalUser
        }
    } catch (err) {
        console.log(err);
        const error = new HttpError(
            'Fetching users failed, please try again later.',
            500
        );
        return next(error);
    }
    res.json(result);
};

module.exports = getUsers