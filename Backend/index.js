import express from "express";
import cors from "cors";
import authRouter from "./routes/authRoutes.js"; // Importing authentication routes

const app = express(); // Initialize the Express application

// Enable Cross-Origin Resource Sharing (CORS) for the server
app.use(
  cors({
    origin: "*", // Allow requests from any origin
    methods: ["GET", "POST"], // Restrict HTTP methods to GET and POST
  })
);

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Use the authentication router for routes starting with "/auth"
app.use("/auth", authRouter);

// Define a basic route for the root URL
app.get("/", (req, res) => {
  console.log("req.body"); // Log the request body to the console
  res.send("Welcome to the API"); // Send a response message to the client
});

// Start the server and listen on the specified port
app.listen(process.env.PORT, () => {
  console.log("Server is Running on Port:", process.env.PORT); // Log that the server has started
});
