// src/app/page.js
'use client'

import { useState, useEffect, useRef } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null); // Create a ref for scrolling to the last message

  useEffect(() => {
    // Determine WebSocket URL based on environment
    const wsUrl =
      process.env.NODE_ENV === "development"
        ? process.env.NEXT_PUBLIC_WS_URL_DEV
        : process.env.NEXT_PUBLIC_WS_URL_PROD;

    // Initialize WebSocket connection
    const ws = new WebSocket(wsUrl);
    setSocket(ws);

    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, { sender: "bot", text: event.data }]);
    };

    return () => ws.close(); // Cleanup on unmount
  }, []);

  useEffect(() => {
    // Scroll to the last message whenever the messages array changes
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (input.trim() && socket) {
      setMessages((prev) => [...prev, { sender: "user", text: input }]);
      socket.send(input);
      setInput(""); // Clear input field
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-green-100 to-orange-100">
      <header className="bg-green-500 text-white text-center py-4 shadow-md">
        <h1 className="text-xl font-bold">Chat with AI</h1>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <span
                className={`px-4 py-2 rounded-lg text-sm ${
                  msg.sender === "user"
                    ? "bg-green-500 text-white"
                    : "bg-orange-300 text-black"
                }`}
              >
                {msg.text}
              </span>
            </div>
          ))}
          {/* Add a dummy element to trigger scroll */}
          <div ref={messagesEndRef} />
        </div>
      </main>
      <footer className="flex items-center p-4 bg-white shadow-inner">
        <input
          type="text"
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-green-300"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          className="ml-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300"
          onClick={sendMessage}
        >
          Send
        </button>
      </footer>
    </div>
  );
}
