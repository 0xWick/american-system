// Libraries
const asyncHandler = require("express-async-handler");

// Models
const Receipt = require("../../models/receiptModel");

// @desc    Cancel a Receipt
// @route   PUT /api/receipt/cancel/:id
// @access  Private
const cancelReceipt = asyncHandler(async (req, res) => {
  const receipt = await Receipt.findById(req.params.id);
  
  // Check if receipt exists
  if (!receipt) {
    res.status(404);
    throw new Error("Receipt not found");
  }

  // Check receipt lifecycle
  if (receipt.lifecycle !== "Sent") {
    res.status(400);
    throw new Error(`Receipt cannot be rejected, Lifeycle is ${receipt.lifecycle}`);
  }

  // Check if the user is the sender
  if (receipt.from.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to cancel this receipt");
  }

  // Change lifecycle to Cancelled
  receipt.lifecycle = "Cancelled";

  // Save
  await receipt.save();

  res.json(receipt);
});

module.exports = { cancelReceipt };
