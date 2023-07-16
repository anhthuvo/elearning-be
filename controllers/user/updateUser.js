const User = require('../../models/user');
const HttpError = require('../../models/http-error');

/**
 * @swagger
 * /api/users/{uid}:
 *   put:
 *     summary: Update user information
 *     description: Only admin token or auth user token can access.  Update only firstname, lastname, phone, role. Only properties are declared in request body will be overwritten. the others are kept the same.
 *     produces:
 *         - application/json
 *     parameters: 
 *         - in: path
 *           name: uid
 *           required: true
 *           description: user ID
 *     security: 
 *         - bearerAuth: []
 *     requestBody:
 *         content:
 *              application/json:
 *                  schema:      # Request body contents
 *                      type: object
 *                      properties:
 *                      <property>:
 *                      example:   # Sample object
 *                          firstname: Everly  
 *                          lastname: Vo
 *     responses:
 *          '200':
 *              description: OK
*/
const updateUser = async (req, res, next) => {
    let existingUser;
    let updatedUser;
    try {
        if (req.userData.role !== 'AD' && req.userData.userId !== req.params.uid) throw "";
        existingUser = await User.findOne({ _id: req.params.uid }, '-password');
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

module.exports = updateUser