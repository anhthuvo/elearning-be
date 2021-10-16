const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String, 
        required: 'Email address is required', 
        unique: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email is not valid'],
    },
    password: {
        type: String,
        minlength: 6
    },
    firstname: {
        type: String, 
        required: 'Fisrt name is required', 
        trim: true,
     },
    lastname: {
        type: String, 
        required: 'Last name is required', 
        trim: true,
        lowercase: true,
    },
    role: {
        type: String, 
        require: true,
        enum: ['HV', 'GV', 'AD'],
        default: 'HV'
    },
    phone: {
        type: String, 
        require: false
    },
    avatar : {
        required: false,
        type: String, 
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
})

module.exports = mongoose.model('User', UserSchema);