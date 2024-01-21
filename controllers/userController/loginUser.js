// Libraries
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Models
const User = require("../../models/userModel");

// @desc    Login User
// @route   POST /api/users/login
// @access  Public

const loginUser = asyncHandler(async (req, res) => {

  // Get email and password from request body
  const { email, password } = req.body;

  // Get User
  const user = await User.findOne({ email });
  console.log(user);
  // Check if the User exists
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Check if the password is correct
  const passwordMatch = await bcrypt.compare(password, user.password);
  console.log(passwordMatch);
  // if (!passwordMatch) {
  //   res.status(401);
  //   throw new Error("Invalid password");
  // }

  // Generate token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  // Send Response
  res.json({
    id: user._id,
    email: user.email,
    userName: user.userName,
    Bio: user.Bio,
    token,
  });
});

module.exports = { loginUser };
