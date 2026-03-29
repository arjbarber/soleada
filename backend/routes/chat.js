import express from "express";
import { db } from "../db.js";
import { ObjectId } from "mongodb";
import admin from "../middleware/firebaseAdmin.js"
import { client } from "../db.js";
import mongoose from "mongoose";

const router = express.Router();

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

const Chat = mongoose.model("Chats", chatSchema);


router.get("/getChats", async (req, res) => {
    const userId = req.user.uid;
    try {
      const results = await Chat.find({
        $or: [
          { userOne: userId },
          { userTwo: userId }
        ]
      });
      return res.json(results);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }
});

router.get("/chatHistory/:id", async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.json([]);
    }

    return res.json(chat);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/sendMessage", async (req, res) => {
  try {
    const { chatID, newMessage, lang, room } = req.body;
    const userId = req.user.uid;

    const chat = await Chat.findById(chatID);
    if (!chat) {
      return res.status(404).json([]);
    }

    // Firestore write
    const messageID = new Date().getTime().toString();
    const now = new Date();

    await admin.firestore()
      .collection("rooms")
      .doc(room)
      .collection("messages")
      .doc(messageID)
      .set({
        content: newMessage,
        ownerID: userId,
        time: admin.firestore.FieldValue.serverTimestamp()
      });

    await admin.firestore()
      .collection("roomVault")
      .doc(room)
      .set({ lastAccessed: now }, { merge: true });

    // MongoDB update
    chat.messages.push({
      user: userId,
      contentEnglish: lang == 0 ? newMessage : "",
      contentSpanish: lang == 1 ? newMessage : ""
    });

    await chat.save();

    return res.json(chat);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});


router.get("/getChats/:user", (req, res) => {
    let userId = req.params.user;

    Chat.find({userOne: userId}).then((resultsOne) => {
        if(resultsOne.length > 0){
            return res.json(resultsOne);
        }else{
            Chat.find({userTwo: userId}).then((resultsTwo) => {
                if(resultsTwo.length > 0){
                    return res.json(resultsTwo);
                }else{
                    return res.json([]);
                }
            });
        }
    });
});

router.get("/getChat/:user/:user2", (req, res) => {
    let user1 = req.params.user;
    let user2 = req.params.user2;

    Chat.find({userOne: user1, userTwo: user2}).then((resultsOne) => {
        Chat.find({userOne: user2, userTwo: user1}).then((resultsTwo) => {
            if(resultsOne && resultsTwo.length > 0){
                // is in res 1
                return resultsOne;
            }else if(resultsTwo && resultsTwo.length > 0){
                return resultsTwo;
            }
        })
    })
})

router.get("/chatHistory/:id", (req, res) => {
    let chatId = req.params.id;
    Chat.find({_id: chatId}).then((result) => {
        if(results.length > 0){
            return results[0];
        }else{
            return [];
        }
    })
})

router.get("/sendMessage/:id/:userID/:newMessage/:lang", async (req, res) => {
    let chatID = req.params.id;
    let newMessage = req.params.newMessage;
    let lang = req.params.lang;
    let userId = req.params.userID;

    const chat = Chat.findById(chatID);

    if(!chat){
        return [];
    }

    // attempting to post to firebase
    await admin.firestore().collection("rooms").doc(req.body.room).collection("messages").doc(`${messageID}`).set({
      ...req.body,
      time: admin.firestore.FieldValue.serverTimestamp(),
      ownerID: req.user.uid
    });

    await admin.firestore().collection("roomVault").doc(req.body.room).set({
      lastAccessed: now
    }, { merge: true })

    Chat.find({_id: chatID}).then((results) => {
        if(results && results.length > 0){
            if(lang == 0){
                chat.messages.push({
                    user: userId,
                    contentEnglish: newMessage,
                    contentSpanish: ""
                });
                chat.save(() => {
                    return chat;
                })
            }else{
                chat.messages.push({
                    user: userId,
                    contentEnglish: "",
                    contentSpanish: newMessage
                });
                chat.save(() => {
                    return chat;
                })
            }
        }else{
            return [];
        }
    })
})

export default router;
