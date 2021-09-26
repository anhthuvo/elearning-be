const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const userController = require('../controllers/user-controllers');
const { signup, getUsers, login, updateAvatar, updateUser, getUser } = userController;

const { checkAuthUser, checkAuthAdmin } = require('../middleware/check-auth');
const fileUpload = require('../middleware/file-upload');

router.post('/signup',
    [
        check('firstname')
            .not()
            .isEmpty(),
        check('lastname')
            .not()
            .isEmpty(),
        check('email')
            .normalizeEmail() // Test@test.com => test@test.com
            .isEmail(),
        check('password').isLength({ min: 6 })
    ],
    signup);

router.post('/login', login);

router.get('/:uid', checkAuthUser, getUser);

router.post('/change-avatar/:uid', checkAuthUser, fileUpload.single('avatar'), updateAvatar);

router.put('/:uid', checkAuthUser, updateUser);

router.get('/all', checkAuthAdmin, getUsers);

router.delete('/uid', checkAuthAdmin, );

module.exports = router;