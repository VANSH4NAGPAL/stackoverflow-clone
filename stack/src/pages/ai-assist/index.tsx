import React, { useState } from "react";
import Mainlayout from "@/layout/Mainlayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Send, User } from "lucide-react";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "react-toastify";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/router";

interface Message {
  role: "user" | "ai";
  content: string;
}

const AIAssist = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hello! I'm your AI coding assistant powered by Gemini. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    if (!user) {
      toast.info("Please login to use AI Assist");
      router.push("/auth");
      return;
    }

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const res = await axiosInstance.post("/ai/ask", { prompt: userMessage });
      if (res.data && res.data.data) {
        setMessages((prev) => [...prev, { role: "ai", content: res.data.data }]);
      }
    } catch (error) {
      console.error("AI Error:", error);
      toast.error("Failed to get response from AI");
      setMessages((prev) => [...prev, { role: "ai", content: "Sorry, I encountered an error processing your request." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Mainlayout>
      <div className="max-w-4xl mx-auto p-4 lg:p-6 h-[calc(100vh-60px)] flex flex-col">
        <div className="mb-4 flex items-center gap-2">
          <Bot className="w-6 h-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-800">AI Assist</h1>
        </div>

        <Card className="flex-1 flex flex-col overflow-hidden shadow-sm">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-3 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"}`}>
                    {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  <div className={`p-3 rounded-lg ${msg.role === "user" ? "bg-blue-600 text-white rounded-tr-none" : "bg-gray-100 text-gray-800 rounded-tl-none"}`}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[80%] flex-row">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="p-3 rounded-lg bg-gray-100 text-gray-800 rounded-tl-none flex items-center">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <div className="p-4 border-t bg-gray-50">
            <form onSubmit={handleSend} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about coding..."
                className="flex-1"
                disabled={loading}
              />
              <Button type="submit" disabled={!input.trim() || loading} className="bg-orange-500 hover:bg-orange-600 text-white px-4">
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <p className="text-xs text-center text-gray-400 mt-2">AI can make mistakes. Consider verifying important information.</p>
          </div>
        </Card>
      </div>
    </Mainlayout>
  );
};

export default AIAssist;
