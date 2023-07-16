const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const userController = require('../controllers/user');
const { checkAuthUser, checkAuthAdmin } = require('../middleware/check-auth');


router.post('/signup',
    [
        check('email')
            // .normalizeEmail()
            .isEmail(),
        check('password').isLength({ min: 6 })
    ],
    userController.signup);

router.post('/login', userController.login);

router.put('/:uid', checkAuthUser, userController.updateUser);

router.delete('/delete', checkAuthAdmin, userController.deteleUsers);

router.get('/', checkAuthAdmin, userController.getUsers);

router.get('/:uid', checkAuthUser, userController.getUser);

module.exports = router;