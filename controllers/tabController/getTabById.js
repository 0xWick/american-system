const asyncHandler = require("express-async-handler");
const Tab = require("../../models/tabModel");

// @desc    Get Tab Details by Tab ID
// @route   GET /api/tabs/:tabId
// @access  Private
const getTabById = asyncHandler(async (req, res) => {

    // Get Tab Id from Request Params
  const tabId = req.params.tabId;

  // Get Tab from Database
  const tab = await Tab.findById(tabId);

    // Check if Tab Exists
    if (!tab) {
        res.status(404);
        throw new Error("Tab not found");
      }


  // Check if one of the Users in the Tab is Requesting the Details
  const loggedInUserId = req.user.id;

  console.log(loggedInUserId)

  console.log(tab.partyAid.toString())
  console.log(tab.partyBid.toString())

  if (tab.partyAid.toString() !== loggedInUserId && tab.partyBid.toString() !== loggedInUserId) {
    res.status(401);
    throw new Error("You are not authorized to view details of this tab");
  }


  res.status(200).json(tab);
});

module.exports = {getTabById};
