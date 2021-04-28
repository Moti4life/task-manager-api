//auth middleware

const jwt = require('jsonwebtoken')
const User = require('../models/user.js')

const auth = async (req, res, next) => {
    
    try{
        //look for the header provided then 
        //remove Bearer in string header
        const token = req.header('Authorization').replace('Bearer ', '')
        //console.log(token)
        //validate that header with the secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        //find the user
        const user = await User.findOne( {_id: decoded._id, 'tokens.token': token }) 
        
        if (!user){
            throw new Error()
        }

        //store token in req
        req.token = token
        //add user onto the request for future purposes
        req.user = user
        next()

    } catch (error){
        res.status(401)
        res.send( { error: 'authentication problem'})

    }
    


}

module.exports = auth




