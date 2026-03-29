import express from "express";
import admin from "../middleware/firebaseAdmin.js";
import { db } from "../db.js"; 
import rateLimit from "express-rate-limit";

const router = express.Router();

const limiter = rateLimit({
  windowMs: 60 * 1000 * 5, // 5 minutes
  max: 1, // max requests per IP per window
  message: "Too many accounts created from this IP, please try later."
});

router.post("/signup", limiter, async (req, res) => {
  const { email, password, displayName, type } = req.body;

  if (!email || !password || !displayName || !type) {
    return res.status(400).json({ error: "Email, password, name, and type are required" });
  }

  // small check to see if acc. already made
  try {
    await admin.auth().getUserByEmail(email);
    return res.status(400).json({ error: "Email already in use" });
  } catch (err) {
    console.log("attempting to make new account");
  }

  // creates firebase user with only basic info here, to prevent frontend access
  const userRecord = await admin.auth().createUser({
    email,
    password,
    displayName
  });

  function randomColor() {
    return 1 + Math.floor(Math.random() * 15);
  }

  try {

    //  for mongo insert with all that juicy metadata
    await db.collection("users").insertOne({
      uid: userRecord.uid,
      email,
      displayName,
      type
    });

    // generates a custom Firebase token for frontend sign-in
    const firebaseToken = await admin.auth().createCustomToken(userRecord.uid);

    return res.status(201).json({
      message: "User created successfully",
      uid: userRecord.uid,
      firebaseToken
    });
  } catch (err) {
    console.error("Failed to create user:", err);
    console.log("failure in account creation");
    console.log("attempting to undo progress in failed account creation");

    await admin.auth().deleteUser(userRecord.uid);

    await db.collection("users").deleteOne({ uid: userRecord.uid });

    console.log("successfully undid progress in failed account creation");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;