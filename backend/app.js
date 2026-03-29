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

async function translateText(text, targetLang) {
  if (!text) return "";
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    return data[0].map(item => item[0]).join('');
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
}

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
    bodySpanish: String,
    embeddings: [Number],
    authorId: String,
    genre: [String]
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

// login + signup

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
            return res.json({success: true, result: result[0]})
        }else{
            return res.json({success: false, result: null});
        }
    })
});

app.get("/signup/:username/:pass/:type/:lang", (req, res) => {
    let usernameGiven = req.params.username;
    let passwordGiven = req.params.pass;
    let userType = req.params.type;
    let lang = parseInt(req.params.lang) || 0;

    let newUser = new Users({
        username: usernameGiven,
        password: passwordGiven, 
        type: userType,
        primaryLang: lang
    });
    newUser.save().then(() => {
        return res.json(newUser);
    });
})

// Getting Posts

app.get("/allPosts", (req, res) => {
    Posts.find({}).then((results) => {
        return res.json(results || []);
    });
});

app.get("/userById/:id", (req, res) => {
    Users.findById(req.params.id).then((user) => {
        if(user){
            return res.json({ _id: user._id, username: user.username, type: user.type });
        }else{
            return res.json(null);
        }
    });
});

app.get("/postByAuthorId/:id", (req, res) => {
    let id = req.params.id;
    Posts.find({authorId: id}).then((results) => {
        return res.json(results);
    })
});

app.get("/postByName/:search/:uType", (req, res) => {
    let searchTerm = req.params.search; //req.body.search;
    let searchDomain = req.params.uType; //req.body.userType;

    Posts.find({title: searchTerm}).then((results) => {
        if(results){
            return res.json(results);
        }else{
            return res.json([]);
        }
    })
});

// Creating posts

app.get("/newPost/:name/:body/:authorId/:type", async (req, res) => {
    let name = req.params.name;
    let body = req.params.body;
    let authorId = req.params.authorId;
    console.log(authorId);
    let type = req.params.type;

    let lang = 0;
    try {
        const author = await Users.findById(authorId);
        if (author && author.primaryLang === 1) lang = 1;
    } catch(err) {
        console.error("Error finding author:", err);
    }

    let bodySpanish = "";
    let bodyEnglish = "";

    if (lang === 0) {
        bodyEnglish = body;
        bodySpanish = await translateText(body, 'es');
    } else {
        bodySpanish = body;
        bodyEnglish = await translateText(body, 'en');
    }

    const newPost = new Posts({
        title: name,
        type: type,
        body: bodyEnglish,
        bodySpanish: bodySpanish,
        embeddings: [],
        authorId: authorId
    });

    newPost.save().then(() => {
        return res.json(newPost);
    })
});

// get chats

app.get("/createChat/:user1/:user2", (req, res) => {
    let user1 = req.params.user1;
    let user2 = req.params.user2;

    let chat = new Chat({
        userOne: user1,
        userTwo: user2,
        messages: []
    });

    chat.save().then(() => {
        return res.json(chat);
    });

})

app.get("/getChats/:user", (req, res) => {
    let userId = req.params.user;

    Chat.find({ $or: [{ userOne: userId }, { userTwo: userId }] }).then((results) => {
        return res.json(results || []);
    });
});

app.get("/getChat/:user/:userTwo", (req, res) => {
    let user1 = req.params.user;
    let user2 = req.params.userTwo;

    Chat.find({userOne: user1, userTwo: user2}).then((resultsOne) => {
        if(resultsOne && resultsOne.length > 0){
            return res.json(resultsOne[0]);
        }else{
            Chat.find({userOne: user2, userTwo: user1}).then((resultsTwo) => {
                    if(resultsTwo && resultsTwo.length > 0){
                        return res.json(resultsTwo[0]);
                    } else {
                        return res.json(null);
                    }
                })
            }
    })
})

app.get("/chatHistory/:id", (req, res) => {
    let chatId = req.params.id;
    Chat.find({_id: chatId}).then((result) => {
        if(result.length > 0){
            return res.json(result[0].messages);
        }else{
            return res.json([]);
        }
    })
})

app.get("/sendMessage/:id/:userID/:userTwo/:newMessage/:lang", (req, res) => {
    let chatID = req.params.id;
    let newMessage = req.params.newMessage;
    let lang = parseInt(req.params.lang) || 0;
    let userId = req.params.userID;
    let userIdTo = req.params.userTwo;

    const chat = Chat.findById(chatID);

    if(!chat){
        res.return([]);
    }

    Chat.find({_id: chatID}).then(async (results) => {
        if(results && results.length > 0){
            if(lang === 0){
                let contentSpanish = await translateText(newMessage, 'es');
                results[0].messages.push({
                    user: userId,
                    contentEnglish: newMessage,
                    contentSpanish: contentSpanish
                });
                results[0].save().then(() => {
                    return res.json(results);
                })
            }else{
                let contentEnglish = await translateText(newMessage, 'en');
                results[0].messages.push({
                    user: userId,
                    contentEnglish: contentEnglish,
                    contentSpanish: newMessage
                });
                results[0].save().then(() => {
                    return res.json(results);
                })
            }
        }else{
            return res.json([]);
        }
    })
})

app.listen(3000);

