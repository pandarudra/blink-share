import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { socket } from "../utils/socket";

export const Home = () => {
  const [roomId, setRoomId] = useState("");
  const [createdRoomId, setCreatedRoomId] = useState("");
  const navigate = useNavigate();

  const createRoom = () => {
    const newId = uuidv4().slice(0, 8); // shorter and shareable

    setRoomId(newId);
    setCreatedRoomId(newId);
    socket.emit("join-room", newId);
    localStorage.setItem("roomId", newId);
    navigate(`/room/${newId}`);
  };

  const joinRoom = () => {
    if (roomId.trim()) {
      socket.emit("join-room", roomId);
      localStorage.setItem("roomId", roomId);
      navigate(`/room/${roomId}`);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(createdRoomId);
    alert("Room ID copied!");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">🔗 Blink Share</h1>
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter or paste Room ID"
          className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <button
          onClick={joinRoom}
          className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition"
        >
          Join Room
        </button>

        <div className="relative my-4">
          <hr className="border-t border-gray-300" />
          <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white px-3 text-sm text-gray-500">
            OR
          </span>
        </div>

        <button
          onClick={createRoom}
          className="w-full bg-green-500 text-white py-2 rounded-md font-medium hover:bg-green-600 transition"
        >
          Create New Room
        </button>

        {createdRoomId && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg border text-sm flex items-center justify-between">
            <span className="text-gray-700 font-mono">{createdRoomId}</span>
            <button
              onClick={copyToClipboard}
              className="ml-4 text-blue-600 hover:underline"
            >
              Copy
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
