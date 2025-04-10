import Message from "../models/MessagesModel.js";

export const getMessages = async (req, res) => {
  try {
    const user1 = req.userId;
    const user2 = req.body.id;

    const { searchTerm } = req.body;
    if (!user1 || !user2) {
      res.status(400).json({ msg: `Both user ID's are required` });
    }

    const messages = await Message.find({
      $or: [
        { sender: user1, recipient: user2 },
        { sender: user2, recipient: user1 },
      ],
    }).sort({ timestamp: 1 });

    return res
      .status(200)
      .json({ msg: "messages retrieved successfully", messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const uploadFile = async (req, res) => {
  try {
    console.log('uploadFile called');
    
    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });
    res.status(200).json({ 
      msg: "File message sent successfully",
      filePath: req.file.path,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Internal server error" });
  }
};