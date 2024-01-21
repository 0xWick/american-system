const express = require("express");
const router = express.Router();

// * Controller
const { createTab } = require("../controllers/tabController/createTab");
const { getTabById } = require("../controllers/tabController/getTabById");
const {getAllTabsByUser} = require("../controllers/tabController/getAllTabsByUser")

// * Middlewares
const { authMiddleware } = require("../middleware/userAuthMiddleware");

// ? Routes
// Write
router.route("/createTab").post(authMiddleware, createTab);

// Read
router.route("/getAllTabsByUsers").get(authMiddleware, getAllTabsByUser);

router.route("/:tabId").get(authMiddleware, getTabById);

module.exports = router;