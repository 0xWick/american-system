const express = require("express");
const router = express.Router();

// Controller
const { getUsers } = require("../controllers/userController/getUsers");
const { getUser } = require("../controllers/userController/getUser");
const { createUser } = require("../controllers/userController/createUser");
const { updateUser } = require("../controllers/userController/updateUser");
const { deleteUser } = require("../controllers/userController/deleteUser");
const {getUserByEmail} = require("../controllers/userController/getUserByEmail")

// Authentications
const { loginUser } = require("../controllers/userController/loginUser");

// Middleware
const { authMiddleware } = require("../middleware/userAuthMiddleware");

// Routes
router.route("/profile").get(authMiddleware, getUser)

router.route("/").get(getUsers).post(createUser);

router.route("/exists").post(getUserByEmail)

// Routes by Id
router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

// Login Route
router.route("/login").post(loginUser);



module.exports = router;