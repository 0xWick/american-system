const asyncHandler = require("express-async-handler");
const Tab = require("../../models/tabModel");

// @desc    List all Tabs associated with a User
// @route   GET /api/tabs/user/:userId
// @access  Private
const getAllTabsByUser = asyncHandler(async (req, res) => {
  
  // Get the User's Id from Auth
    const userId = req.user.id;

    // Get Tabs for User
  const tabs = await Tab.find({ $or: [{ partyAid: userId }, { partyBid: userId }] });

  res.json(tabs);
});

module.exports = {getAllTabsByUser};
