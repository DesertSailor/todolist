// Filename - index.js 

// Set express as Node.js web application
// server framework.
const { connectToMongoDB, disconnectFromMongoDB } = require('./db');
const mongoose = require('mongoose');
const express = require('express');
const _ = require('lodash');
const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));





// const conn = mongoose.connect('mongodb://localhost:27017/todolistDB')

const taskSchema = new mongoose.Schema({
    task:{ type: String }
})

const listschema = new mongoose.Schema({
    name: { type: String, required: true },
    items: [taskSchema]
})

const Task = mongoose.model('Task', taskSchema);
const List = mongoose.model('List', listschema);

async function fetchalltasks() {
  try {
    // 1. Wait for connection
    await connectToMongoDB();
    const tasks = await Task.find({})
    
    return tasks;
  } catch (error) {
    console.error("Error:", error);
  
    // 3. Gracefully close connection
    
  }
//   await mongoose.connection.close();
}
async function deletetask(taskName) {
  try {
    // 1. Wait for connection
    await connectToMongoDB();
    await Task.deleteOne({ task: taskName });
  } catch (error) {
    console.error("Error:", error);
  }
}

async function runadd(item) {
  try {
    // 1. Wait for connection
    await connectToMongoDB();
    const task = new Task({ task: item });
    await task.save();
  } catch (error) {
    console.error("Error:", error.cause);
  }
}

async function addtolist(item, template) {
  try {
    // 1. Wait for connection
    await connectToMongoDB();
    await List.updateOne({ name: template }, { $push: { items: { task: item } } });
  } catch (error) {
    console.error("Error:", error);
  }
}



// Set EJS as templating engine
app.set('view engine', 'ejs')

let today = new Date().getDay();
var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };


app.get("/", async (req,res) => {
    
    const tasks = await fetchalltasks();
    let day = new Date().toLocaleDateString('en-US', options);
    

    res.render("daypage", { day: day , tasks: tasks })
})

app.post("/" , async (req,res) => {
    let day = new Date().toLocaleDateString('en-US', options)
    const item = req.body.task
    await runadd(item)
    res.redirect("/")
    

})

app.post("/delete", async (req,res) => {
    const taskName = req.body;
    console.log( taskName.task);
    await deletetask(taskName.task);
    res.redirect("/");
})  
app.get("/:template", async (req,res) => {

    const template = _.startCase(req.params.template);
    const found = await List.findOne({ name: template }).exec()
    if (found) {
        
        res.render("todo", { list: found })
    }
    else {
        try {
            await connectToMongoDB();
            const newlist = new List({ name: template, items: [] });
            await newlist.save();
            res.redirect("/" + template)
        } catch (error) {
            console.error("Error:", error);
        }
       
    }
        
    
    
})

app.post("/:template", async (req,res) => {
    const template = req.params.template;
    const item = req.body.task;
    await addtolist(item, template);
    res.redirect("/" + template);
})


app.post("/:template/delete", async (req,res) => {
    const template = req.params.template;
    const taskName = req.body.task;
    try {
        await connectToMongoDB();
        await List.updateOne({ name: template }, { $pull: { items: { task: taskName } } });
        res.redirect("/" + template);
    } catch (error) {
        console.error("Error:", error);
    }
  })



app.listen(3000, function(){
    console.log("server running")
})