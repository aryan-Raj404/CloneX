import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { AiOutlineSend } from "react-icons/ai";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const ChatPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [messageContent, setMessageContent] = useState("");
  const [participant, setParticipant] = useState(null);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  // Get the user profile
  const { data: userProfile, isLoading: userLoading } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      const res = await fetch(`/api/user/profile/${username}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch user");
      return data;
    },
  });

  useEffect(() => {
    if (userProfile) {
      setParticipant(userProfile);
    }
  }, [userProfile]);

  // Get chats to find messages if chat exists
  const { data: chats } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const res = await fetch("/api/messages/chats");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch chats");
      return data;
    },
  });


  const existingChat = chats?.find((c) => c.participant?.username === username);

  // Fetch messages for this chat if it exists
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["messages", existingChat?._id],
    queryFn: async () => {
      const res = await fetch(`/api/messages/${existingChat._id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch messages");
      return data;
    },
    enabled: !!existingChat?._id,
    refetchInterval: 2000,
  });

  // Send message mutation
  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/messages/send/${participant._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageContent }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send message");
      return data;
    },
    onSuccess: () => {
      setMessageContent("");
      // Refetch both chats and messages to show the new message
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (messageContent.trim() && participant) {
      sendMessage();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (userLoading) {
    return (
      <div className="flex-[4_4_0] border-r border-gray-700 min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Check if user is trying to message themselves
  if (participant && authUser && participant._id === authUser._id) {
    return (
      <div className="flex-[4_4_0] border-r border-gray-700 min-h-screen bg-black flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-900 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4v2m0 0v2m0-10V7a5 5 0 1110 0v2"
              />
            </svg>
          </div>
          <p className="text-gray-400 mb-4 text-lg font-semibold">You can't message yourself</p>
          <button
            onClick={() => navigate("/messages")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full"
          >
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="flex-[4_4_0] border-r border-gray-700 min-h-screen bg-black flex flex-col items-center justify-center">
        <p className="text-gray-400 mb-4">User not found</p>
        <button
          onClick={() => navigate("/messages")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-full"
        >
          Back to Messages
        </button>
      </div>
    );
  }

  return (
    <div className="flex-[4_4_0] border-r border-gray-700 min-h-screen bg-black flex flex-col">
      {/* Chat Header */}
      <div className="sticky top-0 bg-black bg-opacity-95 backdrop-blur border-b border-gray-700 px-4 py-3 flex items-center gap-3 z-10">
        <button
          onClick={() => navigate("/messages")}
          className="text-gray-400 hover:text-white hover:bg-gray-900 rounded-full p-2 transition-colors"
        >
          <IoArrowBack className="w-5 h-5" />
        </button>

        <img onClick={() => navigate(`/profile/${participant.username}`)}
          src={participant.profileImg || "/avatar-placeholder.png"}
          alt={participant.fullName}
          className="w-10 h-10 rounded-full cursor-pointer"
        />

        <div onClick={() => navigate(`/profile/${participant.username}`)} className="flex-1">
          <h2 className="cursor-pointer font-bold text-white">{participant.fullName}</h2>
          <p className="cursor-pointer text-xs text-gray-400">@{participant.username}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messagesLoading ? (
          <div className="flex justify-center items-center h-full">
            <LoadingSpinner />
          </div>
        ) : messages && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="font-semibold">No messages yet</p>
            <p className="text-sm text-gray-600">Say hi to start the conversation!</p>
          </div>
        ) : !messages || messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="font-semibold">No messages yet</p>
            <p className="text-sm text-gray-600">Say hi to start the conversation!</p>
          </div>
        ) : (
          messages?.map((message) => {
            const isOwn = message.senderId._id === authUser?._id;
            return (
              <div key={message._id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                    isOwn
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-800 text-gray-100 rounded-bl-none"
                  }`}
                >
                  <p>{message.content}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-black border-t border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-gray-900 text-white placeholder-gray-600 rounded-full px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
          />

          <button
            onClick={handleSendMessage}
            disabled={isPending || !messageContent.trim()}
            className="text-blue-400 hover:text-blue-300 disabled:text-gray-600 disabled:cursor-not-allowed hover:bg-gray-900 rounded-full p-2 transition-colors"
          >
            {isPending ? (
              <div className="w-5 h-5 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
              </div>
            ) : (
              <AiOutlineSend className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;