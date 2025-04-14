import { Server } from "socket.io";

export const onSocket = (io: Server) => {
  io.on("connection", (socket) => {
    console.log("Client connected", socket.id);

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      const users = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
      io.to(roomId).emit("room-users", users);
    });

    socket.on("leave-room", (roomId) => {
      socket.leave(roomId);
      const users = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
      io.to(roomId).emit("room-users", users);
    });

    socket.on("file-share", ({ sender, roomId, fileName, fileData }) => {
      console.log(`File received from ${socket.id} to room ${roomId}`);

      socket.to(roomId).emit("receive-file", {
        sender,
        fileName,
        fileData,
      });
    });
    socket.on("chat-message", ({ roomId, message }) => {
      socket.to(roomId).emit("receive-message", `${socket.id}: ${message}`);
    });
    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
    });
  });
};
