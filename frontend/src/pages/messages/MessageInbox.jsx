import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { IoSearch } from "react-icons/io5";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const MessageInbox = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: chats, isLoading } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const res = await fetch("/api/messages/chats");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch chats");
      return data;
    },
  });

  const filteredChats =
    chats?.filter(
      (chat) =>
        chat.participant.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.participant.username.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <div className="flex-[4_4_0] border-r border-gray-700 min-h-screen bg-black">
      <div className="w-full h-screen flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-black bg-opacity-80 backdrop-blur border-b border-gray-700 p-4 z-10">
          <h2 className="text-2xl font-bold text-white mb-4">Messages</h2>

          <div className="relative">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 text-white placeholder-gray-500 rounded-full pl-10 pr-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <LoadingSpinner />
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500 p-4">
              <p className="text-center">No messages yet</p>
              <p className="text-sm text-gray-600 mt-2">Start a conversation</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => navigate(`/messages/${chat.participant.username}`)}
                className="border-b border-gray-700 p-4 hover:bg-gray-900 cursor-pointer transition-colors"
              >
                <div className="flex gap-3">
                  <img
                    src={chat.participant.profileImg || "/avatar-placeholder.png"}
                    alt={chat.participant.fullName}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-white">
                        {chat.participant.fullName}
                      </h3>
                      {chat.unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 truncate">
                      {chat.lastMessage?.content || "No messages yet"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageInbox;