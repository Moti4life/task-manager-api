//start point
// run db, robo3t, postman
//use this to run db
// /Users/moti/mongodb/bin/mongod.exe --dbpath=/Users/moti/mongodb-data

const express = require('express')
require('./db/mongoose.js')
//const User = require('./models/user.js') already migrated to router files
//const Tasks = require('./models/task.js')

const app = express()
const port = process.env.PORT

//import routers
const userRouter = require('./routers/user.js')
const taskRouter = require('./routers/task.js')


app.use(express.json())

app.use(userRouter)
app.use(taskRouter)


app.listen( port, () => {
    console.log('server is on port: ' + port)

}) 

