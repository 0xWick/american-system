const asyncHandler = require("express-async-handler");

// Models
const Receipt = require("../../models/receiptModel");
const User = require("../../models/userModel");

// @desc    Create/Send a new Receipt
// @route   POST /api/receipts/send
// @access  Private
const sendReceipt = asyncHandler(async (req, res) => {
  console.log("Here")
  const { title, description, amount, receiverId } = req.body;

  console.log({
    title,
    description,
    amount,
  
    receiverId,
  })

  // Get Receiver using Mongoose
  const receiver = await User.findById(receiverId);
  // Sender
  const userId = req.user.id;
  const sender = await User.findById(userId);

  console.log(sender)
  
  // ? Check if the User is sending to himself
  if (receiverId === userId) {
    res.status(400);
    throw new Error("You cannot send a receipt to yourself");
  }

  // ? Check if the Receiver exists
  if (!receiver) {
    res.status(400);
    throw new Error("Receiver does not exist");
  }

  // Get Both User Details
  // Sender Details
  const [ fromUserId, from ] = [sender._id, sender.userName];
  console.log({fromUserId, from})

  // Receiver Details
  const [toUserId, to ] = [receiver._id, receiver.userName];
  console.log({toUserId, to})

// ! TODO: Update according to Latest Model
  // Create Receipt
  const receipt = await Receipt.create({
    title,
    description,
    amount,
    dates: {
      dateCreated: new Date(),
      dueDate: dueDate,
    },
    lifecycle: "Sent",
    status: "Negative",
    from: from,
    fromUserId: fromUserId,
    to: to,
    toUserId: toUserId,
  });

  console.log(receipt)

  // Add Receipt Id to Receiver ReceiptSent Array
  const receiverReceipts = await receiver.ReceiptsReceived
  receiverReceipts.push(receipt._id)
  receiver.ReceiptsReceived = receiverReceipts
  await receiver.save()

  // Add Receipt Id to Sender ReceiptSent Array
  const senderReceipts = await sender.ReceiptsSent
  senderReceipts.push(receipt._id)
  sender.ReceiptsSent = senderReceipts
  await sender.save()

  res.status(201).json(receipt);
});

module.exports = { sendReceipt };
