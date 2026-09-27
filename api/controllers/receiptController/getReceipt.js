const asyncHandler = require("express-async-handler");

// Models
const Receipt = require("../../models/receiptModel");

// @desc    Get Receipt by Id
// @route   GET /api/receipts/:receiptId
// @access  Private

const getReceipt = asyncHandler(async (req, res) => {

    // Get Receipt ID
    const receiptId = req.params.receiptId;

    // Get Receipt
    const receipt = await Receipt.findById(receiptId);

    res.status(200).json(receipt);

});

module.exports = { getReceipt };