"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Send } from "lucide-react";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedMessages = JSON.parse(localStorage.getItem("chatHistory") || "[]");
    setMessages(savedMessages);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim()) return;
  
    const userMsg = {
      role: "user",
      content: message,
      time: new Date().toLocaleTimeString(),
    };
  
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setMessage("");
    setLoading(true);
  
    try {
      const res = await axios.post("http://localhost:5000/chat", {
        message,
        history: updatedHistory,
      });
  
      const reply = res.data.reply;
      const botTime = new Date().toLocaleTimeString();
  
      let currentContent = "";
      const botMsg = {
        role: "bot",
        content: currentContent,
        time: botTime,
      };
  
      setMessages((prev) => [...prev, botMsg]);
  
      let i = 0;
      const interval = setInterval(() => {
        currentContent += reply.charAt(i);
        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (updated[lastIndex]?.role === "bot") {
            updated[lastIndex] = {
              ...updated[lastIndex],
              content: currentContent,
            };
          }
          return updated;
        });
  
        i++;
        if (i >= reply.length) {
          clearInterval(interval);
          setLoading(false);
        }
      }, 15);
  
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "⚠️ Failed to get a response.",
          time: new Date().toLocaleTimeString(),
        },
      ]);
      setLoading(false);
    }
  };
  


  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-850 text-white flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-gray-700 text-white rounded-xl shadow-xl flex flex-col h-[600px] transition-all duration-300">
          <div className="px-4 py-3 border-b border-gray-700 justify-center flex items-center gap-2"> 
            <h1 className="text-xl font-semibold text-center"> 🤖 Gemini AI Chatbot</h1>
            <p1 className="text-sm font-medium text-center">(Developed by Bishal)</p1>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`px-4 py-2 rounded-xl text-sm max-w-[75%] shadow-md ${msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-700 text-white"
                    }`}
                >
                  <p>{msg.content}</p>
                  <span className="text-[10px] text-gray-400 block mt-1 text-right">{msg.time}</span>
                </div>
              </div>
            ))}
            {loading && <p className="text-center text-gray-400 text-sm">Typing...</p>}
            <div ref={messagesEndRef}></div>
          </div>

          <div className="p-3 border-t border-gray-700 flex items-center gap-2">
            <textarea
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask something..."
              className="flex-1 resize-none rounded-md px-4 py-2 text-sm bg-gray-700 text-white border focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-blue-600 p-2 rounded-md hover:bg-blue-700 text-white transition"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
  );
}
