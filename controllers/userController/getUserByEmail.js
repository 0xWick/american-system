// Alternative to try/catch for async/await
const asyncHandler = require("express-async-handler");

// Models
const User = require("../../models/userModel");

// ?@desc    Check if a User Exists
// *@route   POST /api/users/exist
// @access   Public
const getUserByEmail = asyncHandler(async (req, res) => {
  const { receiverEmail } = req.body;

  console.log(receiverEmail);

  const receiver = await User.findOne({ email: receiverEmail }).select("-password");

  console.log(receiver);

  // Get User from Id Param without Password
  if (receiver.id) {
    console.log(`Receiver is ${receiver.userName}, ID: ${receiver.id}`);
  }

  res.json(receiver);
});

module.exports = { getUserByEmail };
