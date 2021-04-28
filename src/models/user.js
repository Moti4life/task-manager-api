//user model

const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Tasks = require('./task.js')



const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('email is invalid')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if(value < 0){
                throw new Error('age must be a positive number')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        //minlength: 7,
        validate(pasValue){
            if(validator.contains(pasValue, 'password', {ignoreCase: true})){
                throw new Error('password should not contain "password"')
            }
            else if(pasValue.length <= 6){
                throw new Error('pass must be greater than 6')
            }
        }

    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }

}, {
    timestamps: true
})

//this references Tasks in task model
userSchema.virtual('tasks', {
    ref: 'Tasks',
    localField: '_id',
    foreignField: 'owner'
})

//removes password tokens avatar from profile response
userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject

}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign( {_id: user._id.toString() }, process.env.JWT_SECRET)
    
    user.tokens = user.tokens.concat( { token: token } )
    await user.save()
   
    return token
}



userSchema.statics.findByCredentials = async (tryEmail, tryPassword) => {
    const user = await User.findOne( {email: tryEmail})

    if(!user){
        throw new Error('unable to login')
    }
    const isMatchPass = await bcryptjs.compare(tryPassword, user.password)

    //best if error message is generic for information purposes
    if(!isMatchPass){
        throw new Error('unable to login')
    }

    return user

}



// userSchema.pre()
// userSchema.post()

//hash password
//run this before user is saved
userSchema.pre('save', async function(next) {
    const user = this
    //console.log(user)
    //console.log('just before saving')
    if (user.isModified('password')){
        user.password = await bcryptjs.hash(user.password, 8)
    }

    next()
})

//middleware
//delete user tasks when user is removed
userSchema.pre('remove', async function(next) {
    const user = this
    await Tasks.deleteMany({ owner: user._id })

    next()
})


// this should be defined after hooks
const User = mongoose.model('User' , userSchema)
// this should be defined after hooks

module.exports = User