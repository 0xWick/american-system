const mongoose = require("mongoose");

const Receipt = require("./receiptModel");

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    Bio: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
    },
    userStatus: {
      type: String,
      enum: [
        "Nawab Sahib", // 100% Score
        "Malik Riaz Jr", // 80% Above
        "Kar len ge bro", // 60%
        "Mufta", // Below 50% 
        "Karzai", // Below 30%
        "Naya Murga",
      ],
    },
    CreditScore: {
      type: Number,
      default: 0
    },
    status: {
      // Active or Passive
      type: String,
      required: [true, "Please add user Status"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
