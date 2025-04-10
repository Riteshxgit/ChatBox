import mongoose from "mongoose";
import Channel from "../models/ChannelModel.js";
import User from "../models/UserModel.js";

export const createChannel = async (req, res) => {
  try {
    const { name, members } = req.body;
    const userId = req.userId;

    const admin = await User.findById(userId);
    console.log('here1')
    if(!admin){
      return res.status(400).send({msg: 'Admin user not Found'});
    }

    
    const exists = await Channel.findOne({ name });
    if (exists) return res.status(400).json({ msg:'Channel name is already taken' });
    
    console.log('here4')
    const validMembers = await User.find({_id: { $in: members}})
    if(validMembers.length !== members.length) {
      return res.status(400).send({msg: 'some members are not valid users'})
    }
    
    const newChannel = new Channel({
      name, members, admin: userId, 
    })
    
    console.log('here5')
    await newChannel.save();
    return res.status(201).send({msg: 'New Channel created successfully', channel: newChannel})

  } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Internal server error' });
  }
};

export const getUserChannels = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const channels = await Channel.find({
      $or : [{ admin: userId}, {members: userId}],
    }).sort({updateAt: -1});

    return res.status(201).send({msg: 'New Channel created successfully', channels })

  } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Internal server error' });
  }
};

export const getChannelMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const channel = await Channel.findById(channelId).populate({
      path: 'messages', 
      populate: {
        path: 'sender',
        select: 'firstName lastName image color _id'
      },
    });

    if(!channel) return res.status(404).send({msg: 'Channel not found'});

    const messages = channel.messages;
    return res.status(201).send({msg: 'Channel messages fetched successfully', messages})
  } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Internal server error' });
  }
};