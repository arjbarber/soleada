// import express from "express";
// import { db } from "../db.js";
// import { ObjectId } from "mongodb";
// import admin from "../middleware/firebaseAdmin.js"
// import { client } from "../db.js";
// import mongoose from "mongoose";


// const router = express.Router();

// // schema setup
// const userSchema = new mongoose.Schema({
//     username: String,
//     password: String, 
//     type: Number,
//     primaryLang: Number // 0 == eng, 1 == spanish
// });

// const postSchema = new mongoose.Schema({
//     title: String,
//     type: Number,
//     body: String,
//     embeddings: [Number],
//     authorId: String
// })

// const chatSchema = new mongoose.Schema({
//     userOne: String,
//     userTwo: String,
//     messages: [
//         {
//             user: String,
//             contentEnglish: String,
//             contentSpanish: String
//         }
//     ]
// })

// // create collections

// const Posts = new mongoose.model("Posts", postSchema);
// const Users = new mongoose.model("Users", userSchema);
// const Chat = new mongoose.model("Chats", chatSchema);

// // login + signup
// // handled in ./account.js
// // router.get("/login/:username/:pass", async (req, res) => {
    
// //     let usernameGiven = req.params.username;
// //     let passwordGiven = req.params.pass;

// //     if(!usernameGiven || !passwordGiven || usernameGiven == null || passwordGiven == null){
// //         return res.json({success: false, result: null});
// //     }
// //     console.log("sent");
// //     Users.find({username: usernameGiven, password: passwordGiven}).then((result) => {
// //         if(result && result.length > 0){
// //             console.log(result);
// //             return res.json({success: true, result: result[0]})
// //         }else{
// //             return res.json({success: false, result: null});
// //         }
// //     })
// // });

// // handled by firebase
// // router.get("/signup/:username/:pass/:type", (req, res) => {
// //     let usernameGiven = req.params.username;//req.body.username;
// //     let passwordGiven = req.params.pass;//req.body.password;
// //     let userType = req.params.type;//body.userType;

// //     let newUser = new Users({
// //         username: usernameGiven,
// //         password: passwordGiven, 
// //         type: userType
// //     });
// //     newUser.save().then(() => {
// //         return res.json(newUser);
// //     });
// // })

// // Getting Posts

// router.get("/postByAuthorId/:id", (req, res) => {
//     let id = req.params.id;
//     Posts.find({authorId: id}).then((results) => {
//         return res.json([]);
//     })
// });

// router.get("/postByName/:search/:uType", (req, res) => {
//     let searchTerm = req.params.search; //req.body.search;
//     searchTerm = searchTerm.toLowerCase();
//     let searchDomain = req.params.uType; //req.body.userType;

//     Posts.find({name: searchTerm, type: searchDomain}).then((results) => {
//         if(results){
//             return res.json(results);
//         }else{
//             return res.json([]);
//         }
//     })
// });

// // Creating posts

// router.get("/newPost/:name/:body/:authorId/:type", (req, res) => {
//     let name = req.params.name;
//     let body = req.params.body;
//     let authorId = req.params.authorId;
//     let type = req.params.type;

//     const newPost = new Posts({
//         title: name,
//         type: type,
//         body: body,
//         embeddings: [],
//         authorId: authorId
//     });

//     newPost.save().then(() => {
//         return res.json(newPost);
//     })
// });

// // create chat

// router.get("/getChats/:user", (req, res) => {
//     let userId = req.params.user;

//     Chat.find({userOne: userId}).then((resultsOne) => {
//         if(resultsOne.length > 0){
//             return res.json(resultsOne);
//         }else{
//             Chat.find({userTwo: userId}).then((resultsTwo) => {
//                 if(resultsTwo.length > 0){
//                     return res.json(resultsTwo);
//                 }else{
//                     return res.json([]);
//                 }
//             });
//         }
//     });
// });

// router.get("/getChat/:user/:user2", (req, res) => {
//     let user1 = req.params.user;
//     let user2 = req.params.user2;

//     Chat.find({userOne: user1, userTwo: user2}).then((resultsOne) => {
//         Chat.find({userOne: user2, userTwo: user1}).then((resultsTwo) => {
//             if(resultsOne && resultsTwo.length > 0){
//                 // is in res 1
//                 return resultsOne;
//             }else if(resultsTwo && resultsTwo.length > 0){
//                 return resultsTwo;
//             }
//         })
//     })
// })

// router.get("/chatHistory/:id", (req, res) => {
//     let chatId = req.params.id;
//     Chat.find({_id: chatId}).then((result) => {
//         if(results.length > 0){
//             return results[0];
//         }else{
//             return [];
//         }
//     })
// })

// router.get("/sendMessage/:id/:userID/:newMessage/:lang", (req, res) => {
//     let chatID = req.params.id;
//     let newMessage = req.params.newMessage;
//     let lang = req.params.lang;
//     let userId = req.params.userID;

//     const chat = Chat.findById(chatID);

//     if(!chat){
//         return [];
//     }

//     Chat.find({_id: chatID}).then((results) => {
//         if(results && results.length > 0){
//             if(lang == 0){
//                 chat.messages.push({
//                     user: userId,
//                     contentEnglish: newMessage,
//                     contentSpanish: ""
//                 });
//                 chat.save(() => {
//                     return chat;
//                 })
//             }else{
//                 chat.messages.push({
//                     user: userId,
//                     contentEnglish: "",
//                     contentSpanish: newMessage
//                 });
//                 chat.save(() => {
//                     return chat;
//                 })
//             }
//         }else{
//             return [];
//         }
//     })
// })

// export default router;
