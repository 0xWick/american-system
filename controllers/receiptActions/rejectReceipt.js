// Libraries
const asyncHandler = require("express-async-handler");

// Models
const Receipt = require("../../models/receiptModel");

// @desc    Reject a Receipt
// @route   PUT /api/receipts/reject/:id
// @access  Private
const rejectReceipt = asyncHandler(async (req, res) => {
  
  // Get Receipt
  const receipt = await Receipt.findById(req.params.id);

  // Check if the Receipt exists
  if (!receipt) {
    res.status(404);
    throw new Error("Receipt not found");
  }

  // Check if the Receipt lifecycle is Sent
  if (receipt.lifecycle !== "Sent") {
    res.status(400);
    throw new Error(`Receipt cannot be rejected, Lifeycle is ${receipt.lifecycle}`);
  }

  // Check if the User is authorized to reject this Receipt
  if (receipt.to.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to reject this receipt");
  }

  // Reject Receipt
  receipt.lifecycle = "Rejected";

  // Save
  await receipt.save();

  res.json(receipt);
});

module.exports = { rejectReceipt };
