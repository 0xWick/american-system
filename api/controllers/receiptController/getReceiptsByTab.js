const asyncHandler = require("express-async-handler");

// Models
const Receipt = require("../../models/receiptModel");

// @desc    Get All User Receipts
// @route   GET /api/receipts/getReceipts
// @access  Private

const getReceipts = asyncHandler(async (req, res) => {

    console.log("Getting Receipts API")

    // Get User ID
    const userId = req.user.id;

    console.log(userId)

    // Get User Receipts
    const receipts = await Receipt.find({ $or: [{ fromUserId: userId }, { toUserId: userId }] });

    // Check for Due date of all receipts
    // And update lifecycle to Overdue if needed
    // Only Receipts with Lifecycle = Accepted, Paid
    receipts.forEach(async (receipt) => {
        if (receipt.lifecycle === "Accepted" || receipt.lifecycle === "Paid") {

            // Check Due Date
            if (receipt.dates.dueDate < new Date()) {
                // Update Lifecycle
                receipt.lifecycle = "Overdue";

                // Save
                await receipt.save();
            }
        }
    });

    // Send Response
    res.status(200).json(receipts);
    }
);

module.exports = { getReceipts };