import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { socket } from "../utils/socket";

export const Room = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const slicedRoomId = roomId?.slice(0, 8);
  const [senderId, setSenderId] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileURL, setFileURL] = useState("");
  const [users, setUsers] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(slicedRoomId || "");
    alert("Room ID copied!");
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

  useEffect(() => {
    if (!roomId) return;

    const storedRoomId = localStorage.getItem("roomId");
    if (storedRoomId) {
      socket.emit("join-room", roomId);
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
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
          🎉 Welcome to the Room
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
