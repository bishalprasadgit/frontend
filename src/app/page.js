"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const newMessage = { role: "user", content: message };
    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
    setLoading(true);

    try {
      // 🔹 Send the full conversation history
      const res = await axios.post("http://localhost:5000/chat", { 
        message,
        history: messages // Send past messages
      });

      const botMessage = { role: "bot", content: res.data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [...prev, { role: "bot", content: "⚠️ Failed to get a response. Try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4 text-black">AI Chatbot</h1>

      <div className="w-full max-w-lg bg-white p-4 rounded-lg shadow-md h-96 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-2`}>
            <span className={`px-4 py-2 rounded-lg max-w-xs ${msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-300 text-black"}`}>
              {msg.content}
            </span>
          </div>
        ))}
        {loading && <p className="text-center text-gray-500">Thinking...</p>}
        <div ref={messagesEndRef}></div>
      </div>

      <div className="w-full max-w-lg flex mt-4 text-black">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask something..."
          className="flex-1 border p-2 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button 
          onClick={sendMessage} 
          className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 transition"
          disabled={loading}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}
