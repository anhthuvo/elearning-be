const Course = require('../models/course');
const Registration = require('../models/registration');
const User = require('../models/user');

const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');


/**
 * @swagger
 * /api/courses/create-course:
 *   post:
 *     summary: Create course
 *     security: 
 *         - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:      # Request body contents
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               desc:
 *                 type: string
 *               author: 
 *                  type: string
 *                  format: password
 *               source:
 *                 type: array
 *               category:
 *                  type: string
 *                  enum: ['programming-thinking', 'back-end', 'front-end', 'mobile', 'design', 'full-stack']
 *               path: 
 *                  type: string
 *             example:   # Sample object
 *               title: How to build an MERN app  
 *               desc: Using React, Node.js, Express & MongoDB you'll learn how to build a Full Stack MERN Project - from start to finish. The App is called "Memories" and it is a simple social media MERN application that allows users to post interesting events that happened in their lives.
 *               author: [JavaScript Mastery]
 *               source: [https://www.youtube.com/embed/ngc9gnGgUdA]
 *               image: https://i.morioh.com/67feeaf72f.png
 *               category: programming-thinking
 *               path: how-to-build-an-MERN-app  
 *     responses:
 *          '201':
 *              description: OK
*/
const createCourse = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError(JSON.stringify(errors), 422)
        );
    }

    let createdCourse;
    try {
        createdCourse = new Course({ ...req.body });
        await createdCourse.save();
    } catch (err) {
        err && console.error(err);
        const error = new HttpError(
            'Create course failed, please try again.',
            500
        );
        return next(error);
    }

    res.status(201).json(createdCourse);
};

/**
 * @swagger
 * /api/courses/{path}:
 *   post:
 *     summary: Get course information
 *     description: Any user can get course information except source. Only admin token or auth user was approved can have source of course
 *     produces:
 *         - application/json
 *     parameters: 
 *         - in: path
 *           name: path
 *           required: true
 *           description: course path
 *           default: MongoDB Complete Introduction & Summary
 *     security: 
 *         - bearerAuth: []
 *     responses:
 *          '200':
 *              description: OK 
*/
const getCourse = async (req, res, next) => {
    let existingCourse;
    try {
        existingCourse = await Course.findOne({ title: req.params.id })
        if (!existingCourse) {
            const error = new HttpError(
                'Could not find the course with this path ' + req.params.id,
                500
            );
            return next(error);
        }

        if (!(req.userData &&
            (req.userData.role === 'AD' || existingCourse.students.includes(req.userData.userId)))
        ) {
            const deleteSource = { ...existingCourse._doc };
            delete deleteSource.source;
            return res.json(deleteSource);
        }
    } catch (err) {
        err && console.log(err)
        const error = new HttpError(
            'Fetching course failed, please try again later.',
            500
        );
        return next(error);
    }
    res.json(existingCourse);
};


/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Update user information
 *     description: Only admin token or auth user token can access.  Update only firstname, lastname, phone, role. Only properties are declared in request body will be overwritten. the others are kept the same.
 *     produces:
 *         - application/json
 *     parameters: 
 *         - in: path
 *           name: id
 *           required: true
 *           description: course ID
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
 *                          title: Everly  
 *                          desc: Vo
 *     responses:
 *          '200':
 *              description: OK
*/
const updateCourse = async (req, res, next) => {
    let existingCourse;
    let updatedCourse;
    try {
        existingCourse = await Course.findOne({ _id: req.params.id });
    }
    catch (err) {
        const error = new HttpError(
            'Failed to update course information',
            500
        );
        return next(error);
    }

    if (!existingCourse) {
        return next(new HttpError(
            'No course exist with this id ' + req.params.id,
            404
        ));
    }

    try {
        if (req.body.title) existingCourse.title = req.body.title;
        if (req.body.author) existingCourse.author = req.body.author;
        if (req.body.desc) existingCourse.desc = req.body.desc;
        if (req.body.category) existingCourse.category = req.body.category;
        if (req.body.image) existingCourse.image = req.body.image;

        updatedCourse = await existingCourse.save();
    } catch (err) {
        const error = new HttpError(
            'Failed to update course information',
            500
        );
        return next(error);
    }

    res.json(updatedCourse);
};

/**
 * @swagger
 * /api/courses/all:
 *   get:
 *     summary: Retrieve a list of courses by page and role
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
 *           name: category
 *           default: "programing"
 *           type: string
 *     responses:
 *          '200':
 *              description: OK
*/
const getCourses = async (req, res, next) => {
    let courses;
    let result;
    let totalCourse;
    try {
        const page = parseInt(req.query.page);
        const num_limit = parseInt(req.query.limit);
        const category = req.query.category;

        if (page < 0 || num_limit < 0) throw '';
        const skip_item_num = (page - 1) * num_limit;

        if (category) {
            courses = await Course.find({ category }, '-source').skip(skip_item_num).limit(num_limit);
            totalCourse = await Course.find({ category }).count();
        }
        else {
            courses = await Course.find({}, '-source').skip(skip_item_num).limit(num_limit);
            totalCourse = await Course.find({}).count();
        }

        result = {
            courses: courses.map(course => course.toObject({ getters: true })),
            total_page: Math.ceil(totalCourse / num_limit),
            current_page: page,
            category: category,
            total_course: totalCourse
        }
    } catch (err) {
        console.log(err);
        const error = new HttpError(
            'Fetching courses failed, please try again later.',
            500
        );
        return next(error);
    }
    res.json(result);
};


/**
 * @swagger
 * /api/courses/delete:
 *   delete:
 *     summary: Delete courses
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
 *                      courses:
 *                          type: Array
 *                      example:   # Sample object
 *                          courses: ['1234', '6384'] 
*/
const deteleCourses = async (req, res, next) => {
    let deleteCoursesArr = req.body.courses;
    let result;
    try {
        result = await Course.deleteMany({ _id: { $in: deleteCoursesArr } })
    }
    catch (err) {
        err && console.log(err);
        const error = new HttpError(
            'Delete course failed',
            500
        );
        return next(error);
    }
    res.json(result);
};

/**
 * @swagger
 * /api/courses/register:
 *   post:
 *     summary: register course
 *     description: register course
 *     produces:
 *         - application/json
 *     requestBody:
 *         content:
 *              application/json:
 *                  schema:      # Request body contents
 *                      type: object
 *                      properties:
 *                          courseId:
 *                              type: string
 *                              required: true
 *                          userId:
 *                              type: string
 *                              required: true
 *                      example:   # Sample object
 *                              courseId: '000000000012'
 *                              userId: '000000000012'
 *     responses:
 *          '200':
 *              description: OK
*/
const registerCourse = async (req, res, next) => {
    let result;
    try {
        const courseId = req.body.courseId;
        const userId = req.body.userId;
        const existingCourse = await Course.findOne({ _id: courseId });
        const existingUser = await User.findOne({ _id: userId }, '-password');

        if (existingCourse && existingUser) {
            const existingRes = await Registration.findOne({ courseId, userId });
            if (existingRes) {
                return next(new HttpError(
                    'Already registered course. Waiting for approval',
                    400
                ))
            }

            if (existingUser.courses.includes(courseId)) {
                return next(new HttpError(
                    "this registration has been approved already",
                    402
                ))
            }

            let createdRes;
            createdRes = new Registration({
                userId,
                email: existingUser.email,
                courseId,
                title: existingCourse.title,
                path: existingCourse.path
            });
            result = await createdRes.save();
        }
        else if (!existingCourse) {
            return next(new HttpError(
                "Course doesn't exist",
                400
            ))
        }
        else if (!existingUser) {
            return next(new HttpError(
                "User doesn't exist",
                400
            ))
        }
    }
    catch (err) {
        err && console.log(err);
        const error = new HttpError(
            'Register course failed',
            500
        );
        return next(error);
    }

    res.json(result);
};

/**
 * @swagger
 * /api/courses/registrations:
 *   post:
 *     summary: Retrieve a list of registration by page and filter by user id and course id
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
 *     requestBody:
 *         content:
 *              application/json:
 *                  schema:      # Request body contents
 *                      type: object
 *                      properties:
 *                          courseId:
 *                              type: string
 *                              required: true
 *                          userId:
 *                              type: string
 *                              required: true
 *                      example:   # Sample object
 *                              courseId: '000000000012'
 *                              userId: '000000000012'
 *     security: 
 *         - bearerAuth: []
 *     responses:
 *          '200':
 *              description: OK
*/
const getRegistrations = async (req, res, next) => {
    let result;
    let total;
    try {
        const courseId = req.body.courseId;
        const userId = req.body.userId;
        const latest = req.body.latest;

        const page = parseInt(req.query.page);
        const num_limit = parseInt(req.query.limit);

        if (page < 0 || num_limit < 0) throw '';
        const skip_item_num = (page - 1) * num_limit;

        const filter = {};
        if (courseId) filter.courseId = courseId;
        if (userId) filter.userId = userId;
        // if (latest === false)
        const registrations = await Registration.find({ ...filter }).skip(skip_item_num).limit(num_limit);
        total = await Registration.find(filter).count();

        result = {
            registrations: registrations.map(reg => reg.toObject({ getters: true })),
            total_page: Math.ceil(total / num_limit),
            current_page: page,
            total_registrations: total
        }
    }
    catch (err) {
        err && console.log(err);
        const error = new HttpError(
            'Retrieve registrations failed',
            500
        );
        return next(error);
    }

    res.json(result);
};


/**
 * @swagger
 * /api/courses/approve:
 *   post:
 *     summary: Approve registration 
 *     description: Only admin token can access.
 *     produces:
 *         - application/json
 *     requestBody:
 *         content:
 *              application/json:
 *                  schema:      # Request body contents
 *                      type: object
 *                      properties:
 *                          registationIds:
 *                              type: array
 *                              required: true
 *                      example:   # Sample object
 *                              registationIds: ['000000000012']
 *     security: 
 *         - bearerAuth: []
 *     responses:
 *          '200':
 *              description: OK
*/
const approveRegistration = async (req, res, next) => {
    let approvedReg = [];
    try {
        const registationIds = Array.isArray(req.body.registationIds) && req.body.registationIds;

        if (!registationIds) return next(new HttpError(
            'Invalid data',
            400
        ));

        const existingRegs = await Registration.find({ _id: { $in: registationIds } });

        if (!existingRegs.length) return next(new HttpError(
            'Registrations are not founded',
            401
        ))

        for (let i = 0; i < existingRegs.length; i++) {
            let item = existingRegs[i];
            let userId = item.userId;
            let courseId = item.courseId;

            let [existingCourse, existingUser] = await Promise.all([
                Course.findOne({ _id: courseId }),
                User.findOne({ _id: userId })
            ])

            if (!existingCourse) return (new HttpError(
                'Course does not exist',
                401,
                { approved_registrations: approvedReg }
            ))

            if (!existingUser) return (new HttpError(
                'User does not exist',
                401,
                { approved_registrations: approvedReg }
            ))

            if (existingCourse.students.includes(userId)) return next(new HttpError(
                `User ${userId} already approved in course ${existingCourse._id}, please reject this registration`,
                401,
                {
                    approved_registrations: approvedReg
                }
            ))

            existingCourse.students.push(userId);
            existingUser.courses.push(courseId);

            let [addStudent, addCourse] = await Promise.all([
                existingCourse.save(),
                existingUser.save(),
            ])
            if (addStudent) {
                approvedReg.push(courseId);
                await Registration.deleteOne({ _id: item._id })
            }
        }
    }
    catch (err) {
        err && console.log(err);
        const error = new HttpError(
            'Approve registrations failed',
            500,
            {
                approved_registrations: approvedReg
            }
        );
        return next(error);
    }

    res.status(201).json({ approved_registrations: approvedReg });
};

/**
 * @swagger
 * /api/courses/reject:
 *   post:
 *     summary: Approve registration 
 *     description: Only admin token can access.
 *     produces:
 *         - application/json
 *     requestBody:
 *         content:
 *              application/json:
 *                  schema:      # Request body contents
 *                      type: object
 *                      properties:
 *                          registationIds:
 *                              type: array
 *                              required: true
 *                      example:   # Sample object
 *                              registationIds: ['000000000012']
 *     security: 
 *         - bearerAuth: []
 *     responses:
 *          '200':
 *              description: OK
*/
const rejectRegistration = async (req, res, next) => {
    let rejectedReg;
    try {
        const registationIds = Array.isArray(req.body.registationIds) && req.body.registationIds;

        if (!registationIds) return next(new HttpError(
            'Invalid data',
            400
        ));

        rejectedReg = await Registration.deleteMany({ _id: { $in: registationIds } });
    }
    catch (err) {
        err && console.log(err);
        const error = new HttpError(
            'Reject registrations failed',
            500,
            {
                rejected_registrations: rejectedReg
            }
        );
        return next(error);
    }

    res.status(200).json({ rejected_registrations: rejectedReg });
};

/**
 * @swagger
 * /api/courses/unregister/{id}:
 *   post:
 *     summary: unregister course 
 *     responses:
 *          '200':
 *              description: OK
 *     parameters: 
 *         - in: path
 *           name: id
 *           required: true
 *           description: registration id
*/
const unregister = async (req, res, next) => {
    let deletedReg;
    try {
        const regId = req.params.id;
        deletedReg = await Registration.deleteOne({ _id: regId });
    }
    catch (err) {
        err && console.log(err);
        const error = new HttpError(
            'unregister failed',
            500
        );
        return next(error);
    }

    res.status(200).json(deletedReg);
};

/**
 * @swagger
 * /api/courses/search:
 *   post:
 *     summary: search course 
 *     responses:
 *          '200':
 *              description: OK
 *     produces:
 *         - application/json
 *     requestBody:
 *         content:
 *              application/json:
 *                  schema:      # Request body contents
 *                      type: object
 *                      properties:
 *                          keyword:
 *                              type: string
 *                              required: true
 *                          category:
 *                              type: string
 *                      example:   # Sample object
 *                              keyword: javascript
 *                              category: front-end
*/
const searchCourse = async (req, res, next) => {
    let filteredCourses;
    try {
        const keyword = req.body.keyword;
        const category = req.body.category;

        if (category) {
            filteredCourses = await Course.find({
                $text: { $search: keyword },
                category: category
            }, '-source');
        } else {
            filteredCourses = await Course.find({
                $text: { $search: keyword },
            }, '-source');
        }

    }
    catch (err) {
        console.log(err)
        return next(new HttpError(
            'Searching failed',
            500
        ))
    }

    res.status(200).json({ courses: filteredCourses });
}

module.exports = {
    createCourse,
    getCourses,
    updateCourse,
    getCourse,
    deteleCourses,
    registerCourse,
    getRegistrations,
    approveRegistration,
    rejectRegistration,
    unregister,
    searchCourse
}