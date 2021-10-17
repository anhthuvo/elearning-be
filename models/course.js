const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: {
        type: String, 
        required: true, 
    },
    desc: {
        type: String,
        required: true 
    },
    author: {
        type: Array, 
        required: true
    },
    source: {
        type: Array, 
        required: true
    },
    image: {
        type: String, 
        required: true
    },
    category: {
        type: String, 
        require: false,
        enum: ['programming thinking', 'back-end', 'front-end', 'mobile', 'design', 'full-stack']
    },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    rating: {
        type: Number,
        default: 0
    },
    path: {
        type: String,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
})

module.exports = mongoose.model('Course', CourseSchema);