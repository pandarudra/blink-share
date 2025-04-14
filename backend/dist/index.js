"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const env_1 = require("./configs/env");
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
// import { connectDB } from "./configs/dbConfig";
const appSocket_1 = require("./sockets/appSocket");
const server = (0, http_1.createServer)(app_1.default);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
const PORT = env_1.env.PORT;
// connectDB()
//   .then(() => {
(0, appSocket_1.onSocket)(io);
console.log("Database connected successfully");
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// })
// .catch((error) => {
//   console.error("Database connection error:", error);
// });
