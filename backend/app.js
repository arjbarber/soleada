require('dotenv').config();

const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoose = require("mongoose")
const uri = process.env.MONGO_URL;
const bodyParser = require("body-parser");
const express = require("express");


const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"));

// schema setup
const userSchema = new mongoose.Schema({
    username: String,
    password: String, 
    type: Number,
    primaryLang: Number // 0 == eng, 1 == spanish
});

const postSchema = new mongoose.Schema({
    title: String,
    type: Number,
    body: String,
    embeddings: [Number],
    authorId: String
})

const chatSchema = new mongoose.Schema({
    userOne: String,
    userTwo: String,
    messages: [
        {
            user: String,
            contentEnglish: String,
            contentSpanish: String
        }
    ]
})

// create collections

const Posts = new mongoose.model("Posts", postSchema);
const Users = new mongoose.model("Users", userSchema);
const Chat = new mongoose.model("Chats", chatSchema);

app.get("/login/:username/:pass", async (req, res) => {
    
    let usernameGiven = req.params.username;
    let passwordGiven = req.params.pass;

    if(!usernameGiven || !passwordGiven || usernameGiven == null || passwordGiven == null){
        return res.json({success: false, result: null});
    }
    console.log("sent");
    Users.find({username: usernameGiven, password: passwordGiven}).then((result) => {
        if(result && result.length > 0){
            console.log(result);
            return res.json({success: true, result: result})
        }else{
            return res.json({success: false, result: null});
        }
    })
});


app.get("/signup/:username/:pass/:type", (req, res) => {
    let usernameGiven = req.params.username;//req.body.username;
    let passwordGiven = req.params.pass;//req.body.password;
    let userType = req.params.type;//body.userType;

    let newUser = new Users({
        username: usernameGiven,
        password: passwordGiven, 
        type: userType
    });

    newUser.save().then(() => {
        return res.json(newUser);
    });
})


app.listen(3000);
