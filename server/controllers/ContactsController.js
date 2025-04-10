import mongoose from "mongoose";
import UserModel from "../models/UserModel.js";
import Message from "../models/MessagesModel.js";
import User from "../models/UserModel.js";

export const searchContacts = async (req, res) => {
  try {
    const { searchTerm } = req.body;
    if(!searchTerm || searchTerm==="") {
      res.status(400).json({msg:'searchTerm is required'})
    }
    const sanitizedSearchTerm = searchTerm.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const regex = new RegExp(sanitizedSearchTerm, "i");

    console.log('userId -> ' + req.userId);
    

    const contacts = await UserModel.find({
      $and: [
        { _id: { $ne: req.userId } },
        { $or: [{ firstName: regex }, { lastname: regex }, { email: regex }] }
      ],
    });
    console.log('contacts info -> '+ contacts);

    return res.status(200).json({msg: 'contact searched successfully', contacts})
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Internal server error' });
  }
};

export const getContactsForDMList = async (req, res) => {
  console.log('getContactsForDMList called')
  try {
    let { userId } = req;
    userId = new mongoose.Types.ObjectId(userId);
    
    const contacts = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }],
        }
      },
      {
        $sort: {timestamp: -1},
      },
      {
        $group: {
          _id: {
            $cond: {
              if: {$eq: ['$sender', userId]},
              then: '$recipient',
              else: '$sender',
            },
          },
          lastMessageTime: {$first: '$timestamp'},
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'contactInfo',
        }
      },
      {
        $unwind: "$contactInfo",
      },
      {
        $project: {
          _id: 1,
          lastMessageTime: 1,
          email: '$contactInfo.email',
          firstName: '$contactInfo.firstName',
          lastName: '$contactInfo.lastName',
          image: '$contactInfo.image',
          color: '$contactInfo.color',
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      }
    ]);

    return res.status(200).json({msg: 'DM list retrieved Successfully', contacts})
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Internal server error' });
  }
};

export const getAllContacts = async (req, res, next) => {
  try {
    const users = await User.find( 
        { _id: { $ne: req.userId }},
        "firstName lastName _id email" 
      );

    const contacts = users.map((user) => ({
      label: user.firstName ? `${user.firstName} ${user.lastName}` : user.email,
      value: user._id,
    }));

    return res.status(200).json({ msg:'contacts retrieved successfully', contacts });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};