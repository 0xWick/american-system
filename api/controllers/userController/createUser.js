// Alternative to try/catch for async/await
const asyncHandler = require("express-async-handler");

// Password Hashing
const bcrypt = require("bcryptjs");

// Models
const User = require("../../models/userModel");

// @desc    Create New User
// @route   POST /api/users/register
// @access  Public
const createUser = asyncHandler(async (req, res) => {
  // Get user data from req.body
  const { email, password, userName, Bio, profilePic } = req.body;

  // Validate Data
  if (!email || !password || !userName) {
    return res
      .status(400)
      .json({ error: "Please provide all required fields" });
  }

  // Check if User Email or UserName already exists
  const existingUser = await User.findOne({ $or: [{ email }, { userName }] });
  if (existingUser) {
    return res.status(409).json({ error: "User already exists" });
  }

  // Hash Password
  const hashedPassword = await bcrypt.hash(password, 10);

  // set Enum value
  const userRole = "Naya Murga";

  // Create User
  const user = await User.create({
    email,
    password: password,
    userName,
    Bio,
    profilePic,
    userStatus: userRole,
    status: "Active",
  });

  // Send Response
  res.status(201).json(user);
});

module.exports = { createUser };
