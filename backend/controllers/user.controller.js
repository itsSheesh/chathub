import Conversation from "../models/conversation.model.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    let conversations = await Conversation.find({
      participants: {
        $in : [loggedInUserId]
      }
    })
    return res.status(200).json({conversations: conversations})
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
