const mongoose = require("mongoose");

const User = require("./userModel")

const receiptModel = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  dates: {
    // Date Created
    dateStageA: {
      type: Date,
      required: true,
    },
    // Date Cancelled, Rejected or Accepted
    dateStageB: {
      type: Date,
    },
    // Date Pardoned
    dateStageC: {
      type: Date,
    },
  },
  lifecycle: {
    // Enum
    // 1. Sent // ? Sender Creates a Receipt and Send to another User
    // 2. Cancelled // ? Sender can cancel in case of a mistake
    // 3. Rejected // ? Receiver User can Reject the receipt
    // 4. Accepted // ? Once Receiver Accepts the Receipt, He is bound to pay by the due date
    // 5. Pardoned // ? Event if the Receiver has accepted and not paid, the Sender can Pardon him

    type: String,
    enum: ["Sent", "Cancelled", "Rejected", "Accepted", "Pardoned"],
    required: true,
  },
  // Sender of Receipt Username
  from: {
    type: String,
    required: true
  },
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Receiver of Receipt Username 
  to: {
    type: String,
    required: true,
  },
  // Receiver of Receipt Username 
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
},
{
  timestamps: true,
});

// Export both the Schema and the Model
module.exports = mongoose.model("Receipt", receiptModel);
