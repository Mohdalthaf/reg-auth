import express from "express";
import { connectToDatabase } from "../lib/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

// Route to register a new user
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Connect to the database
    const db = await connectToDatabase();

    // Check if the user already exists
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length > 0) {
      // If user exists, return conflict error
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash the user's password
    const hashPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    await db.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashPassword]
    );

    // Respond with success message
    return res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    // Handle server errors
    return res.status(500).json(err.message);
  }
});

// Route to log in an existing user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Connect to the database
    const db = await connectToDatabase();

    // Check if the user exists
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0) {
      // If user does not exist, return not found error
      return res.status(404).json({ message: "User does not exist" });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, rows[0].password);
    if (!isMatch) {
      // If passwords do not match, return unauthorized error
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Generate a JWT token for the user
    const token = jwt.sign({ id: rows[0].id }, process.env.JWT_KEY, {
      expiresIn: "3h",
    });

    // Respond with the token
    return res.status(201).json({ token: token });
  } catch (err) {
    // Handle server errors
    return res.status(500).json(err.message);
  }
});

// Middleware to verify the JWT token
const verifyToken = async (req, res, next) => {
  try {
    // Extract the token from the Authorization header
    const token = req.headers["authorization"].split(" ")[1];
    if (!token) {
      // If no token is provided, return forbidden error
      return res.status(403).json({ message: "No Token Provided" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    // Attach the user ID to the request object
    req.userId = decoded.id;

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    // Handle token verification errors
    return res.status(500).json({ message: "Server error" });
  }
};

// Protected route to fetch the logged-in user's data
router.get("/home", verifyToken, async (req, res) => {
  try {
    // Connect to the database
    const db = await connectToDatabase();

    // Fetch the user's data using the ID from the token
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [
      req.userId,
    ]);
    if (rows.length === 0) {
      // If user does not exist, return not found error
      return res.status(404).json({ message: "User does not exist" });
    }

    // Respond with the user's data
    return res.status(201).json({ user: rows[0] });
  } catch (err) {
    // Handle server errors
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
