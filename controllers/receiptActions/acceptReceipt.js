// Libraries
const asyncHandler = require("express-async-handler");

// Models
const Receipt = require("../../models/receiptModel");

// @desc    Accept a Receipt
// @route   PUT /api/receipt/accept/:id
// @access  Private
const acceptReceipt = asyncHandler(async (req, res) => {
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

  // Check if the user is the receiver
  console.log(req.user.id)
  console.log(receipt.toUserId.toString())
  if (receipt.toUserId.toString() !== req.user.id) {
    res.status(401);
    throw new Error("Not authorized to accept this receipt");
  }

  // Change lifecycle to Accepted
  receipt.lifecycle = "Accepted";

  // Save
  await receipt.save();

  res.json(receipt);
});

module.exports = { acceptReceipt };
