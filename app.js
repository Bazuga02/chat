const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const llmRoutes = require("./routes/llmRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");
const User = require("./models/userModel");
const Message = require("./models/messageModel");

const app = express();
const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/llm", llmRoutes);

// Error Middleware
app.use(errorMiddleware);

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/chatapp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Socket.io
io.on("connection", (socket) => {
  console.log("A user connected");

  // Join a room based on the user's ID
  socket.on("join", async ({ userId }) => {
    try {
      const user = await User.findById(userId);
      if (user) {
        socket.join(user._id.toString()); // Join a room based on the user's ID
        console.log(`User ${user.email} joined room ${user._id}`);
      }
    } catch (err) {
      console.error("Error joining room:", err);
    }
  });

  // Handle sending a new message
  socket.on("sendMessage", async ({ senderId, receiverId, content }) => {
    try {
      // Create a new message
      const newMessage = await Message.create({
        sender: senderId,
        receiver: receiverId,
        content,
      });

      // Emit the new message to the sender and receiver rooms
      io.to(senderId).to(receiverId).emit("newMessage", newMessage);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  });

  // Handle user status update
  socket.on("updateStatus", async ({ userId, status }) => {
    try {
      // Update the user's status in the database
      const user = await User.findByIdAndUpdate(
        userId,
        { status },
        { new: true }
      );

      // Broadcast the updated status to all connected users
      socket.broadcast.emit("userStatusUpdated", {
        userId: user._id,
        status: user.status,
      });
    } catch (err) {
      console.error("Error updating user status:", err);
    }
  });

  // Handle disconnection
  socket.on("disconnect", async () => {
    console.log("A user disconnected");
    // You can implement additional logic here if needed
  });
});

module.exports = { app, server };
