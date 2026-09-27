// Alternative to try/catch for async/await
const asyncHandler = require("express-async-handler");

// Models
const User = require("../../models/userModel");

// ?@desc    Get User by ID
// *@route   GET /api/users/:id
// @access  Private
const getUser = asyncHandler(async (req, res) => {

  const userId = req.user.id;

  // Get user from Id Param without Password
  const user = await User.findById(userId).select("-password");
  res.json(user);
});

module.exports = { getUser };