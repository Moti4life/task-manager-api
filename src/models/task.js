//task model
const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        trim: true,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        //ref connects User from user model
        ref: 'User'
    }
},{
    timestamps: true
})

// this should be defined after hooks
const Tasks = mongoose.model('Tasks' , taskSchema)
// this should be defined after hooks

module.exports = Tasks