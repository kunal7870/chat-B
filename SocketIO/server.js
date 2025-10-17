import { Server } from "socket.io";
import http from "http";
import express from "express";
import { Socket } from "dgram";

const app = express()
const FRONTEND_URI = process.env.FRONTEND_URI || "http://localhost:3001";


const server = http.createServer(app)
const io = new Server(server,{
    cors:{
        origin:[FRONTEND_URI],  //frontend url
        methods:["GET","POST"],
    }
})

//for realtime messages
export const getReceiverSocketId = (receiverId) =>{
    return users[receiverId];
}

const users ={};

//used to listen events on server side
io.on("connection",(Socket) => {
  console.log("a user connected",Socket.id)
    const userId = Socket.handshake.query.userId;
    if(userId){
        users[userId] = Socket.id;
        console.log("hello", users)
    }
    //used to send events to all connected clients
    io.emit("getOnlineUsers",Object.keys(users))
  //used to listen client side events emitted by server side
  Socket.on("disconnect",() => {
    console.log("a user disconnected",Socket.id);
    delete users[userId]
    io.emit("getOnlineUsers",Object.keys(users))
  }
  )
});
export {app,io,server}