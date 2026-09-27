// Libraries
const asyncHandler = require("express-async-handler");

// Models
const Receipt = require("../../models/receiptModel");

// @desc    Pardon a Receipt
// @route   PUT /api/receipts/pardon/:id
// @access  Private

const pardonReceipt = asyncHandler(async (req, res) => {
  const receipt = await Receipt.findById(req.params.id);

  if (!receipt) {
    res.status(404);
    throw new Error("Receipt not found");
  }

  // Check receipt lifecycle
  // Only Accepted, Overdue can be pardoned
  if (receipt.lifecycle !== "Accepted" && receipt.lifecycle !== "Overdue") {
    res.status(400);
    throw new Error(`Receipt cannot be pardoned, Lifeycle is ${receipt.lifecycle}`);
  }

  // Check due date
  // Receipt can only be pardoned within 3 days of due date
  const today = new Date();
  const dueDate = new Date(receipt.dueDate);
  const diffTime = Math.abs(dueDate - today);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays > 3) {
    res.status(400);
    throw new Error("Receipt can only be pardoned within 3 days of due date");
  }

  // Check if the user is the sender
  if (receipt.from.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to pardon this receipt");
  }

  // Change lifecycle to Pardoned
  receipt.lifecycle = "Pardoned";

  // Update Date ended
  receipt.dates.dateEnded = new Date();

  // Save
  await receipt.save();

  res.json(receipt);
});

module.exports = { pardonReceipt };
