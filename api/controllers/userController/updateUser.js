// Alternative to try/catch for async/await
const asyncHandler = require("express-async-handler");

// Password Hashing
const bcrypt = require("bcryptjs");

// Models
const User = require("../../models/userModel");

// @desc    Update User
// @route   PUT /api/users/:id
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
    // Get user data from req.body
    const { email, userName, Bio, profilePic } = req.body;
    const userId = req.params.id;
  
    // Validate Data
    if (!email || !userName) {
      return res.status(400).json({ error: "Please provide email and userName" });
    }
  
    try {
      // Check if User exists
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Update new fields and keep rest same
      user.email = email || user.email;
      user.userName = userName || user.userName;
      user.Bio = Bio || user.Bio
      user.profilePic = profilePic || user.profilePic
  
      // Save updated user
      await user.save();
  
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });
  
  module.exports = { updateUser };
  