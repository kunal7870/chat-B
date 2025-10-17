import { getReceiverSocketId, io } from "../SocketIO/server.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { Socket } from "socket.io";
export const sendMessage = async (req, res)=>{
    // console.log("Message sent. ",req.params.id, req.body.message);
    try {
        const {message} = req.body;
        const {id: receiverId} = req.params;
        const senderId = req.useri._id;

        let conversation = await Conversation.findOne({
            members:{$all:[senderId, receiverId]}
        })
        if(!conversation){
            conversation = await Conversation.create({
                members:[senderId,receiverId],
            })
        }
        const newMessage = new Message({
            senderId,
            receiverId,
            message
        })
        if(newMessage){
            conversation.messages.push(newMessage._id);
        }
        //await conversatioin.save();
        // await newMessage.save();
        await Promise.all([conversation.save(), newMessage.save()])

        //passing receiverId
        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMessage)
        }

        res.status(200).json({
            message: "message sent succefully",
            newMessage
        })
        

    } catch (error) {
        // console.log("Error in sendMessage", error)
        res.status(500).json({error: " server error"})
    }
}

// export const getMessage = async (req,res) => {
//     try {
//         const {id: receiverId} = req.params;
//         const senderId = req.useri._id;

//         let conversation = await Conversation.findOne({
//             members:{$all:[senderId, receiverId]}
//         }).populate("messages");
//         if(!conversation){
//             return res.status(201).json([])
//         }
//         const messages = conversation.messages;
//         res.status(201).json(messages);
//     } catch (error) {
//         console.log("error in getmessage", error)
//         res.status(400).json({error: "Server error in getMessage"})
//     }
// }
export const getMessage = async (req, res) => {
    try {
        const { id: receiverId } = req.params;
        const senderId = req.useri._id;

        let conversation = await Conversation.findOne({
            members: { $all: [senderId, receiverId] }
        }).populate("messages");

        if (!conversation) {
            return res.status(200).json([]); // 200 OK
        }

        const messages = conversation.messages;
        res.status(200).json(messages); // 200 OK
    } catch (error) {
        // console.log("error in getMessage", error);
        res.status(500).json({ error: "Server error in getMessage" }); //  500 for server errors
    }
}

