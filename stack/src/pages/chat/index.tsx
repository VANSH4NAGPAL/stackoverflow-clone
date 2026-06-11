import React, { useEffect, useState, useRef } from "react";
import Mainlayout from "@/layout/Mainlayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, User as UserIcon } from "lucide-react";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const ChatPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }
    const fetchUsers = async () => {
      try {
        const res = await axiosInstance.get("/user/getalluser");
        setUsers(res.data.data.filter((u: any) => u._id !== user._id));
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [user]);

  useEffect(() => {
    if (selectedUser) {
      fetchConversation();
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversation = async () => {
    if (!selectedUser) return;
    setLoadingChat(true);
    try {
      const res = await axiosInstance.get(`/chat/conversation/${selectedUser._id}`);
      setMessages(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const res = await axiosInstance.post("/chat/send", {
        receiverId: selectedUser._id,
        content: newMessage,
      });
      // Add the new message locally immediately
      setMessages([...messages, {
        ...res.data.data,
        sender: user,
        receiver: selectedUser
      }]);
      setNewMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  if (!user) return null;

  return (
    <Mainlayout>
      <div className="max-w-6xl mx-auto h-[calc(100vh-60px)] p-4 flex gap-4">
        {/* Left Sidebar: Users List */}
        <div className="w-1/3 bg-white border rounded-lg shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-800">Direct Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingUsers ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : (
              users.map((u) => (
                <div
                  key={u._id}
                  onClick={() => setSelectedUser(u)}
                  className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 border-b ${
                    selectedUser?._id === u._id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                  }`}
                >
                  <Avatar className="w-10 h-10 mr-3">
                    <AvatarFallback>{u.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="overflow-hidden">
                    <h3 className="font-medium text-sm text-gray-900 truncate">{u.name}</h3>
                    <p className="text-xs text-gray-500 truncate">Click to chat</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Area: Chat History */}
        <div className="flex-1 bg-white border rounded-lg shadow-sm flex flex-col overflow-hidden">
          {selectedUser ? (
            <>
              <div className="p-4 border-b bg-gray-50 flex items-center">
                <Avatar className="w-10 h-10 mr-3">
                  <AvatarFallback>{selectedUser.name[0]}</AvatarFallback>
                </Avatar>
                <h2 className="font-semibold text-gray-800">{selectedUser.name}</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {loadingChat ? (
                  <div className="text-center text-gray-500">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-10">No messages yet. Say hi!</div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender._id === user._id || msg.sender === user._id;
                    return (
                      <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] rounded-lg p-3 ${
                          isMe ? "bg-blue-600 text-white rounded-tr-none" : "bg-white border text-gray-800 rounded-tl-none"
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                          <span className={`text-[10px] mt-1 block ${isMe ? "text-blue-200" : "text-gray-400"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 border-t bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newMessage.trim()} className="bg-blue-600 text-white">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <MessageSquareIcon className="w-16 h-16 text-gray-300 mb-4" />
              <p>Select a user to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </Mainlayout>
  );
};

// Add missing icon
const MessageSquareIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

export default ChatPage;
