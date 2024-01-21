// Alternative to try/catch for async/await
const asyncHandler = require("express-async-handler");

// Models
const User = require("../../models/userModel");

// @desc    Delete User
// @route   DELETE /api/users/:id
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
  // Get user ID from URL parameter
  const userId = req.params.id;

  // Find user by ID and delete
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ message: "User deleted successfully" });
});

module.exports = { deleteUser };
