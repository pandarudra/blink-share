import { Server, Socket } from "socket.io";

export const onSocket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log("Client connected", socket.id);

    socket.on("join-room", (roomId: string) => {
      socket.join(roomId);
      const users = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
      io.to(roomId).emit("room-users", users);
    });

    socket.on("leave-room", (roomId: string) => {
      socket.leave(roomId);
      const users = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
      io.to(roomId).emit("room-users", users);
    });

    socket.on(
      "file-share",
      ({
        sender,
        roomId,
        fileName,
        fileData,
      }: {
        sender: string;
        roomId: string;
        fileName: string;
        fileData: ArrayBuffer;
      }) => {
        console.log(`File received from ${socket.id} to room ${roomId}`);

        socket.to(roomId).emit("receive-file", {
          sender,
          fileName,
          fileData,
        });
      }
    );

    socket.on(
      "chat-message",
      ({ roomId, message }: { roomId: string; message: string }) => {
        socket.to(roomId).emit("receive-message", `${socket.id}: ${message}`);
      }
    );

    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
    });
  });
};
