const mongoose = require("mongoose");

const User = require("./userModel");

const Receipt = require("./receiptModel");

const tabModel = mongoose.Schema(
  {
    partyAname: {
      type: String,
      required: true,
    },
    partyBname: {
      type: String,
      required: true,
    },
    partyAid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    partyBid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amountOwedByA: {
      type: Number,
      required: true,
    },
    amountOwedByB: {
      type: Number,
      required: true,
    },
    lastOverdueCheck: {
      type: Date,
      required: true
    },
    ReceiptsSentByA: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Receipt" }],
      default: [],
    },
    ReceiptsSentByB: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Receipt" }],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Export both the Schema and the Model
module.exports = mongoose.model("Tab", tabModel);
