const express = require("express");

const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 8001;
const colors = require("colors");

const connectDB = require("./config/db");
const { urlencoded } = require("express");
// const { errorHandler } = require("./middleware/errorMiddleware");

const cors = require("cors");

// Connect to MongoDB
connectDB();

// Create Express APP
const app = express();

// CORS
app.use(cors());

// Necessary Middleware
app.use(express.json());
app.use(urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.json({Message: "Hello Gareebo!"})
})

// Routes
app.use("/api/users", require("./routes/userRoutes"));
// app.use("/api/receipts", require("./routes/receiptRoutes"));
app.use("/api/tabs", require("./routes/tabRoutes"));

// Error Handling Middleware
// app.use(errorHandler);

// ! Authentication Middleware

// Start the Server
app.listen(PORT, () => {
  console.log("Server started on PORT: " + PORT);
});