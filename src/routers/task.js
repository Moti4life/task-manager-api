const express = require('express')
const router = new express.Router()
const Tasks = require('../models/task.js')
const auth = require('../middleware/auth.js')

//create new task
router.post('/tasks', auth, async (req, res) => {
    //const newTask = new Tasks(req.body)
   
    /* newTask.save().then( () => {
        res.status(201)
        res.send(newTask)

    }).catch( (error) => {
        res.status(400)
        res.send(error)
    }) */
    const newTask = new Tasks({
        ...req.body,
        owner: req.user._id
    })


    try {
        await newTask.save()
        res.status(201)
        res.send(newTask)
    }catch (error) {
        res.status(400)
        res.send(error)
    }
    

})

//update existing resource for tasks
router.patch('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id //get unique ID
    const updates = Object.keys(req.body) //get update in body
    const allowedParams = ['completed', 'description']
    //compate every update in updates vs allowedParameters
    const isValidOperation = updates.every( (update) => {
        return allowedParams.includes(update)
        //will return boolean

    })
    //console.log(typeof(isValidOperation))
    if(!isValidOperation){
        return res.status(400).send( { error: 'invalid update parameter'})
    }

    try{
        const updateTask = await Tasks.findOne({_id: _id, owner: req.user._id})
        //will get each listed parameter in updates like description and completed
        if (!updateTask){
            return res.status(404).send()
        }

        updates.forEach( (parameter) => {
            updateTask[parameter] = req.body[parameter]

        }) 
        await updateTask.save()
              
        res.send(updateTask)

    }catch (error) {
        res.status(400)
        res.send(error)

    }


})


//get all tasks
// get /tasks?completed=false
// get /tasks?completed=true
// get /tasks?limit=10&skip=0 //skip is number of results
// get /tasks?sortBy=createdAt:asc or desc
router.get('/tasks', auth, async (req, res) => {


    /* Tasks.find( {} ).then( (task) => {
        res.send(task)

    }).catch( (error) => {
        res.status(500)
        res.send(error)
    }) */
    const match = {}
    const sort = {}
    
    if(req.query.completed){
        //match.completed will return a boolean
        match.completed = req.query.completed.toLowerCase() === 'true'
        /* console.log(match)
        console.log(typeof(match.completed)) */
    }
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        console.log(parts[0])
        console.log(parts[1])
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
        console.log(sort)
    }


    try{
        // const allTasks = await Tasks.find( {owner: req.user._id})
        // res.send(allTasks)
        
        
        //alt method
        await req.user.populate({
            path: 'tasks',
            match, //this gets const match
            options: {
                limit: parseInt(req.query.limit) || 10,
                skip: parseInt(req.query.skip),
                sort //shorthand syntax for sort
            }
        }).execPopulate()
        res.send(req.user.tasks)  
        //console.log(req.user.tasks)

    }catch (error){
        res.status(500)
        res.send(error)
        
    }
    
})

//get task by ID
router.get('/tasks/:id' , auth , async (req, res) => {
    const _id = req.params.id
    //console.log(req.params)


    /* Tasks.findById(_id).then( (task) => {
              
        res.send(task)
        

    }).catch( (error) => {
        if(error.name === 'CastError'){
            return res.status(404).send()
        }

        res.status(500).send(error)

    }) */
    
    try {
        const selectedTask = await Tasks.findOne( {_id: _id, owner: req.user._id} )

        if(!selectedTask){
            return res.status(404).send()
        }
        res.send(selectedTask)


    }catch (error) {
        res.status(500).send()
    }

})

//delete task 
router.delete('/tasks/:id', auth, async (req, res) => {
    

    try{        
        const deleteTask = await Tasks.findOneAndDelete({_id: req.params.id, owner: req.user._id })
        if(!deleteTask){
            return res.status(404).send()
        }
        res.send(deleteTask)

    }catch (error){
        res.status(500)
        res.send(error)

    }

})

module.exports = router