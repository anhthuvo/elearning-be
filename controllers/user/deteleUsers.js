const User = require('../../models/user');
const HttpError = require('../../models/http-error');


/**
 * @swagger
 * /api/users/delete:
 *   delete:
 *     summary: Delete account
 *     description: Only admin token can access.
 *     produces:
 *         - application/json
 *     security: 
 *         - bearerAuth: []
 *     requestBody:
 *         content:
 *              application/json:
 *                  schema:      # Request body contents
 *                      type: object
 *                      properties:
 *                      users:
 *                          type: Array
 *                      example:   # Sample object
 *                          users: ['1234', '6384'] 
*/
const deteleUsers = async (req, res, next) => {
    let deleteUsersArr = req.body.users;
    let result;
    try {
        result = await User.deleteMany({ _id: { $in: deleteUsersArr } })
    }
    catch (err) {
        console.log(err);
        const error = new HttpError(
            'delete user failed',
            500
        );
        return next(error);
    }
    res.json(result);
};

module.exports = deteleUsers
