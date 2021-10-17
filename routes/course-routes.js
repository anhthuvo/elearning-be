const express = require('express');
const router = express.Router();
const { check } = require('express-validator');

const courseController = require('../controllers/course-controller');
const { createCourse, getCourse, deteleCourses, getCourses, updateCourse, registerCourse, getRegistrations, approveRegistration } = courseController;

const { checkAuthAdmin, decodeToken } = require('../middleware/check-auth');

router.post('/create-course',
    [
        check('title')
            .not()
            .isEmpty(),
        check('desc')
            .not()
            .isEmpty(),
        check('author')
            .not()
            .isEmpty(),
        check('source')
            .not()
            .isEmpty(),
        check('image')
            .not()
            .isEmpty(),
        check('category')
            .not()
            .isEmpty()
    ],
    checkAuthAdmin,
    createCourse);

router.put('/:id', checkAuthAdmin, updateCourse);

router.delete('/delete', checkAuthAdmin, deteleCourses);

router.post('/register', registerCourse);

router.post('/registrations', checkAuthAdmin, getRegistrations);

router.get('/all', getCourses);

router.get('/:id', decodeToken, getCourse);

router.post('/approve', checkAuthAdmin, approveRegistration);

module.exports = router;