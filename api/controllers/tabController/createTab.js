const asyncHandler = require("express-async-handler");

const Tab = require("../../models/tabModel");

const User = require("../../models/userModel");

// @desc    Create a new Tab between two users
// @route   POST /api/tabs/create
// @access  Private
const createTab = asyncHandler(async (req, res) => {
  // Get Values from Request Body
  const { partyAname, partyBname, partyAid, partyBid } = req.body;

  // console.log(partyAname, partyAid, partyBid, partyBname)

  // Validate Input
  if (!partyAname || !partyBname || !partyAid || !partyBid) {
    res.status(400);
    throw new Error("Please provide both partyA and partyB details");
  }

  // Check if Both Users Exist
  const userA = await User.findById(partyAid);
  const userB = await User.findById(partyBid);



  // Only One of the Users logged in can create a Tab
  // Check if the logged-in user is one of the parties
  const loggedInUserId = req.user.id;

  // console.log(userA._id.toString())
  // console.log(userB)
  // console.log(loggedInUserId)

  if (
    loggedInUserId.toString() !== userA._id.toString() &&
    loggedInUserId.toString() !== userB._id.toString()
  ) {
    res.status(401);
    throw new Error("You are not authorized to create this tab");
  }

  if (!userA || !userB) {
    res.status(400);
    throw new Error("One or both users do not exist");
  }

  // Check if partyA and partyB are different users
  if (partyAid.toString() === partyBid.toString()) {
    res.status(400);
    throw new Error("partyA and partyB must be different users");
  }

  // Check if Tab is Unique (No Other Tab exists between these two Parties)
  const existingTab = await Tab.findOne({
    $or: [
      { partyAid, partyBid },
      { partyAid: partyBid, partyBid: partyAid },
    ],
  });
  if (existingTab) {
    res.status(400);
    throw new Error("A tab already exists between these two parties");
  }

  // * Default values
  // Balance is Zero at the Start
  amountOwedByA = 0;
  amountOwedByB = 0;

  // Receipts
  ReceiptsSentByA = [];
  ReceiptsSentByB = [];

  // Last Check is Now
  lastOverdueCheck = Date.now();

  const tab = await Tab.create({
    partyAname,
    partyBname,
    partyAid,
    partyBid,
    amountOwedByA,
    amountOwedByB,
    lastOverdueCheck,
    ReceiptsSentByA,
    ReceiptsSentByB,
  });

  res.status(201).json(tab);
});

module.exports = { createTab };
