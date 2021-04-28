const mongoose = require('mongoose')
const validator = require('validator')


mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})


//--------

//insert
/* const person = new User({
    name: '  motiqure  ',
    age: 1000,
    email: '  MOTI@moti.com',
    password: 'jamord'
})

person.save().then( (result) => {
    console.log(result)
}).catch( (error) => {
    console.log(error)
}) */
//--------------






//==============
/* const errand = new Tasks({
    description: 'learn new2',
    //completed: true
})

errand.save().then( (result) => {
    console.log(result)
}).catch( (error) => {
    console.log(error)
})  */

//==============
