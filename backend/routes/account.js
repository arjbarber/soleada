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

  if (!email || !password || !displayName || type == null) {
    console.log(req.body)
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

  try {

    //  for mongo insert with all that juicy metadata
    await db.collection("users").insertOne({
      uid: userRecord.uid,
      email,
      displayName,
      password,
      type
    });

    // generates a custom Firebase token for frontend sign-in
    const firebaseToken = await admin.auth().createCustomToken(userRecord.uid);

    // return res.status(201).json({
    //   message: "User created successfully",
    //   uid: userRecord.uid,
    //   firebaseToken
    // });

    // Example response
    return res.status(201).json({
      message: "User created successfully",
      firebaseToken,
      backendUser: {
        _id: userRecord.uid,          // MongoDB _id
        username: displayName,    // or however you store username
        password,                 // ideally hashed
        type,
        primaryLang: 0            // optional default
      }
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

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Username and password required" });
  }

  try {
    const user = await db.collection("users").findOne({ displayName: username });

    if (!user) {
      console.log("heyy")
      return res.status(401).json({ success: false, message: "User not found" });
    }
    console.log("hello")


    // TODO: Replace plain check with bcrypt.compare if passwords are hashed
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    // Generate Firebase custom token using UID stored in MongoDB
    const firebaseToken = await admin.auth().createCustomToken(user.uid);

    const { password: _, ...safeUser } = user;

    return res.json({
      success: true,
      result: [safeUser],
      firebaseToken,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;