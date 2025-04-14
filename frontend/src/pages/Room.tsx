import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { socket } from "../utils/socket";
import toast, { Toaster } from "react-hot-toast";

export const Room = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const slicedRoomId = roomId?.slice(0, 8);
  const [senderId, setSenderId] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileURL, setFileURL] = useState("");
  const [users, setUsers] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const copyToClipboard = () => {
    navigator.clipboard.writeText(slicedRoomId || "");
    toast.success("Room ID copied to clipboard!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !roomId) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result;
      socket.emit("file-share", {
        sender: socket.id,
        roomId,
        fileName: file.name,
        fileData: arrayBuffer,
      });
    };
    reader.readAsArrayBuffer(file);
  };

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("chat-message", { roomId, message });
      setMessages((prev) => [...prev, `You: ${message}`]);
      setMessage("");
    }
  };
  useEffect(() => {
    socket.on("receive-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receive-message");
    };
  }, []);

  useEffect(() => {
    const storedRoomId = localStorage.getItem("roomId");
    const activeRoomId = roomId || storedRoomId;

    if (activeRoomId) {
      socket.emit("join-room", activeRoomId);
      localStorage.setItem("roomId", activeRoomId);
    }

    socket.on("receive-file", ({ sender, fileName, fileData }) => {
      if (sender === socket.id) return;
      setSenderId(sender);
      const blob = new Blob([new Uint8Array(fileData)]);
      const url = URL.createObjectURL(blob);
      setFileURL(url);
      setFileName(fileName);
    });

    socket.on("room-users", (userList: string[]) => {
      setUsers(userList);
    });

    return () => {
      socket.off("receive-file");
      socket.off("room-users");
    };
  }, [roomId]);

  const LeaveRoom = () => () => {
    localStorage.removeItem("roomId");
    socket.emit("leave-room", roomId);
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-200 relative p-4">
      <Toaster />
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-4xl space-y-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center wfont">
          Blink Share v1🌟
        </h1>

        <div className="flex flex-col md:flex-row md:justify-between gap-6">
          {/* Room Info & Upload */}
          <div className="flex-1 space-y-4">
            <div className="p-4 bg-gray-100 rounded-lg border flex items-center justify-between">
              <span className="text-gray-800 font-mono break-all">
                Room ID: <strong>{slicedRoomId}</strong>
              </span>
              <button
                onClick={copyToClipboard}
                className="ml-4 text-blue-600 hover:underline text-sm"
              >
                Copy
              </button>
            </div>

            <p className="text-sm text-gray-600">
              Share the above ID to invite others.
            </p>

            <input
              type="file"
              ref={inputRef}
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
            />

            {fileURL && (
              <div className="bg-green-50 border border-green-300 rounded-md p-3 text-sm">
                <p className="text-green-700 font-semibold">File Received:</p>
                <p>
                  📄 <strong>{fileName}</strong> from{" "}
                  <code className="text-purple-700">{senderId}</code>
                </p>
                <a
                  href={fileURL}
                  download={fileName}
                  className="text-green-700 underline mt-2 inline-block"
                >
                  Download
                </a>
              </div>
            )}
          </div>

          {/* Users List */}
          <div className="flex-shrink-0 w-full md:w-56 bg-gray-50 p-4 rounded-lg border h-fit">
            <h3 className="text-gray-700 font-semibold mb-2">👥 Users</h3>
            <ul className="space-y-1 max-h-40 overflow-y-auto text-sm">
              {users.length > 0 ? (
                users.map((user, i) => (
                  <li
                    key={i}
                    className={`px-2 py-1 rounded ${
                      user === socket.id
                        ? "bg-purple-200 text-purple-900 font-bold"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {user === socket.id ? "You" : user}
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No users yet</li>
              )}
            </ul>
          </div>
        </div>

        {/* Chat UI */}
        <div className="w-full border rounded-lg p-4 bg-gray-50 shadow-inner">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">💬 Chat</h2>
          <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className="p-2 bg-white border rounded-md shadow-sm text-sm text-gray-800"
              >
                {msg}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message"
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
            />
            <button
              onClick={sendMessage}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={LeaveRoom()}
        className="absolute bottom-6 right-6 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg"
      >
        Leave Room
      </button>
    </div>
  );
};
