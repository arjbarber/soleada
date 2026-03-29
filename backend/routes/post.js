import express from "express";
import { db } from "../db.js";
import { ObjectId } from "mongodb";
import admin from "../middleware/firebaseAdmin.js"
import { client } from "../db.js";

const router = express.Router();

const postSchema = new mongoose.Schema({
    title: String,
    type: Number,
    body: String,
    embeddings: [Number],
    authorId: String
})

const Posts = new mongoose.model("Posts", postSchema);

router.get("/postByName/:search/:uType", async (req, res) => {
  try {
    const searchTerm = req.params.search;
    const searchDomain = req.params.uType;

    const results = await Posts.find({
      name: { $regex: searchTerm, $options: "i" }, // case-insensitive
      type: searchDomain
    });

    return res.json(results);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});
// Creating posts

router.get("/newPost/:name/:body/:authorId/:type", async (req, res) => {
    const name = req.params.name;
    const body = req.params.body;
    const type = req.params.type;
    const postID = new ObjectId();

    const embedResponse = await fetch("http://ml:8000/embed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts, clusterProfiles: userClusterProfiles })
    });

    const embedData = await embedResponse.json()

    if (!embedData) {
      console.log("embedData is falsy:", embedData);
      throw new Error("No Embedding Recieved!");
    }

    if (!embedData.embedding) {
      console.log("embedding is falsy:", embedData.embedding);
      throw new Error("No Embedding Recieved!");
    }

    const newPost = await db.collection("posts").insertOne({
        _id : postID,
        title: name,
        type: type,
        body: body,
        embedding: embedData.embedding,
        authorId: req.user.uid
    })

    return res.json(newPost);
});

export default router;
