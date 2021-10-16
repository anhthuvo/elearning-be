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
        require: false
    },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    rating: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
})

module.exports = mongoose.model('Course', CourseSchema);