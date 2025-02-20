'use client'
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Button } from "./components/button/button";
import { Input } from "./components/input/input";
import "tailwindcss/tailwind.css";

export default function Page() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typingMessage, setTypingMessage] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCallChatBotAPI = async (message) => {
    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) throw new Error("Failed to fetch response");
      console.log("response", response);
      const data = await response.json();
      return data.message;
    } catch (error) {
      console.error("Error calling chatbot API:", error);
      return "I'm sorry, but something went wrong.";
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (isMounted) {
      scrollToBottom();
    }

    return () => {
      isMounted = false;
    };
  }, [messages, typingMessage]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setTypingMessage(true);

    const botReplyText = await handleCallChatBotAPI(input);
    setTypingMessage(false);
    setMessages([...newMessages, { sender: "bot", text: botReplyText }]);
  };

  const handleOnKeydown = async (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Ngăn việc xuống dòng
      await sendMessage(); // Gọi hàm submit
    }
  };

  return (
      <div className="flex flex-col h-screen bg-black text-white">
        <div className="p-4 bg-gray-800 border-b border-gray-700 shadow-lg">
          <h1 className="text-2xl font-bold text-center text-white">
            Chatbot Assistant
          </h1>
          <p className="text-sm text-center text-gray-400">
            Ask me anything and I will try to help!
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-3 rounded-xl shadow-lg break-words ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white ml-auto"
                  : "bg-gray-700 text-gray-200"
              }`}
              style={{ maxWidth: "75%", width: "fit-content" }}>
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </motion.div>
          ))}
          {typingMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4 rounded-xl shadow-lg max-w-fit bg-gray-700 text-gray-200 flex items-center gap-1">
              <span className="dot bg-gray-500 w-2 h-2 rounded-full animate-pulse"></span>
              <span className="dot bg-gray-500 w-2 h-2 rounded-full animate-pulse delay-150"></span>
              <span className="dot bg-gray-500 w-2 h-2 rounded-full animate-pulse delay-300"></span>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t border-gray-700 p-4 flex items-end gap-4 bg-gray-800 h-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={handleOnKeydown}
          />
          <Button
            onClick={sendMessage}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md">
            Send
          </Button>
        </div>
      </div>
  );
}
