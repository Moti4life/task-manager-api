const express = require('express')
const router = new express.Router()
const User = require('../models/user')

const auth = require('../middleware/auth.js')
const sharp = require('sharp')

const multer = require('multer')
const { sendWelcomeEmail, subscriptionCancelEmail } = require('../emails/account.js')


/* router.get('/test', (req, res) => {
    res.send('from a new file')


}) */

//create new user
router.post('/users', async (req, res) => {
    const newUser = new User(req.body)

    /* newUser.save().then( () => {
        res.status(201)
        res.send(newUser)

    }).catch( (error) => {
        res.status(400)
        res.send(error)

        // same as res.status(400).send(error)
    })  */

    try {
        await newUser.save()
        sendWelcomeEmail(newUser.email, newUser.name)
        const token = await newUser.generateAuthToken()
        res.status(201)
        res.send( { newUser, token} )
    } catch (error) {
        res.status(400)
        res.send(error)
        
    }

    
})

//login route
router.post('/users/login', async (req, res) => {

    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
       
        res.send( {user, token} )

    }catch(error){
        res.status(400)
        res.send()
        //dont send any error that gives away info
        //console.log(error)
    }

})

//logout route
router.post('/users/logout' , auth, async (req, res) => {
    try {
        //filter out all tokens of user.tokens 
        //return tokens that are not your current session token
        req.user.tokens = req.user.tokens.filter( (token) => {
            return token.token !== req.token
        })
        await req.user.save()
        //res.status(200)
        res.send()

    }catch (error){
        res.status(500)
        res.send()
    }

})

//logout all session tokens
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        //set user tokens array into empty
        req.user.tokens = []
        await req.user.save()
        res.status(200)
        res.send()

    }catch (error){
        res.status(500)
        res.send()
    }



})


//get profile
//with middleware
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)

})

//update existing resource for user
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedParams = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every( (update) => {
        return allowedParams.includes(update)
    })
    if(!isValidOperation){
        return res.status(400).send( { error: 'invalid update parameter'})
    }

    try{
        
        //will get each listed parameter in updates like name etc
        updates.forEach( (parameter) => {
            req.user[parameter] = req.body[parameter]
        })
        await req.user.save()
        res.send(req.user)

    }catch (error) {
        res.status(400)
        res.send(error)

    }


})

//delete for user
router.delete('/users/me', auth, async (req, res) => {
    // const _id = req.user._id
    try{
        // const deleteUser = await User.findByIdAndDelete(_id)
        // if(!deleteUser){
        //     return res.status(404).send()
        // }
        await req.user.remove()
        subscriptionCancelEmail(req.user.email, req.user.name)
        res.send(req.user)

    }catch (error){
        res.status(500)
        res.send(error)

    }

})

//upload avatar 
//call multer set destination
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        //this should return cb | callback
        // file.originalname.match(/    /)
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb (new Error('file upload must be jpg | jpeg | png'))
        }   
        cb(undefined, true)
    }
})

//upload user avatar and store
router.post('/users/me/avatar', auth ,  upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).png().resize({ width: 250, height: 250 }).toBuffer()
    req.user.avatar = buffer
        
    await req.user.save()
    res.send()
},(error, req, res, next) => {
    //this function needs to have this call signature (error, req, res, next )
    
    res.status(400)
    res.send({ error: error.message })
})


//clear avatar 
router.delete('/users/me/avatar', auth , async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.status(200)
    res.send()

})

//view avatar
router.get('/users/:id/avatar', async (req, res) => {
    try{
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error()
        }
        
        res.set('Content-Type' , 'image/png')
        res.send(user.avatar)
    }catch (error) {
        res.status(404)
        res.send()
    }


})


module.exports = router