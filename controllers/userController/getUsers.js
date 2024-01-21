// Alternative to try/catch for async/await
const asyncHandler = require("express-async-handler");

// Models
const User = require("../../models/userModel");

// ? @desc    Get all Users
// *@route   GET /api/users
// @access  Private
const getUsers = asyncHandler(async (req, res) => {
  // Get all users with "Active Status"
  const Users = await User.find({ status: "Active" }).select('-password');

  res.json(Users);
});

module.exports = { getUsers };
