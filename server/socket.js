import { Server as SocketIOServer } from 'socket.io'
import Message from './models/MessagesModel.js'
import ChannelModel from './models/ChannelModel.js'

const setupSocket = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  const disconnect = (socket) => {
    console.log('Client Disconnected: ' + socket.id);
    for(const [userId, socketId] of userSocketMap.entries()) {    
      if(socket.id === socketId) {
        userSocketMap.delete(userId);
        break;
      }
    }
  };


  const handleSendMessage = async (message) => {
    const senderSocketId = userSocketMap.get(message.sender);
    const recipientSocketId = userSocketMap.get(message.recipient);
  
    const createdMessage = await Message.create(message);
  
    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "_id email firstName lastName image color")
      .populate("recipient", "_id email firstName lastName image color");
  
    console.log('messageData', messageData);

    if (recipientSocketId) {
      io.to(recipientSocketId).emit("receiveMessage", messageData);
    }
    
    if (senderSocketId) {
      io.to(senderSocketId).emit("receiveMessage", messageData);
    }
  };

  const sendChannelMessage = async (message) => {
    console.log("sendChannelMessage called");
    try {
      const { sender, content, messageType, fileUrl, channelId } = message;

      // 1. Create message
      const createdMessage = await Message.create({
        sender,
        recipient: null,
        content,
        messageType,
        timestamp: new Date(),
        fileUrl,
      });

      // 2. Get populated message
      const messageData = await Message.findById(createdMessage._id)
        .populate({
          path: "sender",
          model: "User",
          select: "_id email firstName lastName image color",
        })
        .exec();

      // 3. Update channel
      await ChannelModel.findByIdAndUpdate(channelId, {
        $push: { messages: createdMessage._id },
      });

      // 4. Get channel with populated data
      const channel = await ChannelModel.findById(channelId)
        .populate({
          path: "members",
          model: "User",
        })
        .populate({
          path: "admin",
          model: "User",
        });

      if (!channel) {
        console.error("Channel not found:", channelId);
        return;
      }

      const finalData = {
        ...messageData._doc,
        channelId: channel._id,
      };

      // 5. Get sender's socket ID
      const senderSocketId = userSocketMap.get(sender.toString());

      // 6. Send to ALL members (including sender)
      if (channel.members?.length) {
        console.log('sending msg to members:------------------- ');
        channel.members.forEach((member) => {
          if (member?._id) {
            const memberSocketId = userSocketMap.get(member._id.toString());
            if (memberSocketId) {
              io.to(memberSocketId).emit("receive-channel-message", finalData);
              console.log("Message sent to member:", member._id);
            }
          }
        });
      }

      // 7. Send to ALL admins (whether they sent the message or not)
      if (channel.admin && Array.isArray(channel.admin)) {
        console.log('sending msg to admins:-------------------- ')
        channel.admin.forEach(admin => {
          const adminSocketId = userSocketMap.get(admin._id.toString());
          if (adminSocketId) {
            io.to(adminSocketId).emit("receive-channel-message", finalData);
            console.log(`Message sent to admin ${admin._id}`);
          }
        });
      }

      // 8. Send to sender if not already sent (when sender isn't a member)
    } catch (error) {
      console.error("Error in sendChannelMessage:", error);
    }
  };

  io.on('connection', (socket)=> {
    const userId = socket.handshake.query.userId;
    if(userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User Connected: ${userId} with socket ID; ${socket.id}`);
    } else {
      console.log('user Id not provided during handshake');
    }

    socket.on('sendMessage', (message)=> handleSendMessage(message));
    socket.on('send-channel-message', sendChannelMessage);
    socket.on('disconnect', ()=>disconnect(socket));
  })
};

export default setupSocket;