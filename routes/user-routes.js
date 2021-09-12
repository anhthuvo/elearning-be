const express = require('express');
const router = express.Router();
const userController = require('../controllers/user-controllers');
const { check } = require('express-validator');
const { signup, getUsers, login, updateAvatar, updateUser } = userController;
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

router.get('/login', login);

router.use(checkAuthUser);

router.put('/change-avatar', fileUpload.single('avatar'), updateAvatar);

router.put('/:uid', updateUser);

router.use(checkAuthAdmin);

router.get('/all', getUsers);

router.delete('/uid',);

module.exports = router;