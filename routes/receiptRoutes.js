const express = require("express");

const router = express.Router();


// * Controller

const { getReceipt } = require("../controllers/receiptController/getReceipt");
// const { getReceipts } = require("../controllers/receiptController/getReceipts");

// * Actions
const { sendReceipt } = require("../controllers/receiptActions/sendReceipt");
const { rejectReceipt } = require("../controllers/receiptActions/rejectReceipt");
const { pardonReceipt } = require("../controllers/receiptActions/pardonReceipt");
const { cancelReceipt } = require("../controllers/receiptActions/cancelReceipt");
const { acceptReceipt } = require("../controllers/receiptActions/acceptReceipt");

// * Middlewares
const { authMiddleware } = require("../middleware/userAuthMiddleware");

// ? Routes

// Get All User Receipts
router.route("/getReceipts").get(authMiddleware, getReceipts);

// Receipt Actions
// Create or Send
router.route("/send").post(authMiddleware, sendReceipt);

// Reject
router.route("/reject/:id").put(rejectReceipt);

// Pardon
router.route("/pardon/:id").put(pardonReceipt);

// Pay
router.route("/pay/:id").put(paidReceipt);

// ConfirmPayment
router.route("/confirm/:id").put(confirmPayment);

// Cancel
router.route("/cancel/:id").put(cancelReceipt);

// Accept
router.route("/accept/:id").put(authMiddleware, acceptReceipt);

// ! Routes with Params at bottom
// Get Receipt by Id
router.route("/:receiptId").get(getReceipt);



module.exports = router;