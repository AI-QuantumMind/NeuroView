import React, { useState, useEffect, createContext, useContext } from "react";
import PropTypes from "prop-types";
import ReactMarkdown from "react-markdown";
import { Brain, Sun, Moon, Send, Download, Trash2 } from "lucide-react";
import Navbar from "./components/Navbar";

// -----------------------
// Chat Context and Hook
// -----------------------
const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = (content, sender) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        content,
        sender,
        timestamp: new Date(),
      },
    ]);
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <ChatContext.Provider
      value={{ messages, addMessage, clearChat, isLoading, setIsLoading }}
    >
      {children}
    </ChatContext.Provider>
  );
};

ChatProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useChat = () => useContext(ChatContext);

// -----------------------
// ChatMessage Component
// -----------------------
export const ChatMessage = ({ message }) => {
  const isBot = message.sender === "bot";

  return (
    <div className={`flex ${isBot ? "justify-start" : "justify-end"} mb-4`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isBot
            ? "bg-blue-100 text-blue-900 dark:bg-blue-800 dark:text-blue-100"
            : "bg-blue-500 text-white dark:bg-blue-600"
        }`}
      >
        {isBot ? (
          // Render bot messages with markdown styling
          <div className="prose dark:prose-dark text-sm">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm">{message.content}</p>
        )}
        <span className="text-xs opacity-75 block mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

ChatMessage.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    sender: PropTypes.oneOf(["user", "bot"]).isRequired,
    timestamp: PropTypes.instanceOf(Date).isRequired,
  }).isRequired,
};

// -----------------------
// ChatInput Component
// -----------------------
export const ChatInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
      <textarea
        className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-2 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
        placeholder="Type your message..."
        rows={1}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled}
      />
      <button
        className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 dark:hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleSend}
        disabled={disabled || !message.trim()}
      >
        <Send size={20} />
      </button>
    </div>
  );
};

ChatInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

// -----------------------
// LoadingIndicator Component
// -----------------------
export const LoadingIndicator = () => {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-blue-100 dark:bg-blue-800 rounded-lg px-4 py-2">
        <div className="flex space-x-2">
          <div
            className="w-2 h-2 bg-blue-500 dark:bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="w-2 h-2 bg-blue-500 dark:bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="w-2 h-2 bg-blue-500 dark:bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      </div>
    </div>
  );
};

// -----------------------
// ChatInterface Component
// -----------------------
export const ChatInterface = () => {
  const { messages, addMessage, clearChat, isLoading, setIsLoading } =
    useChat();

  const handleSendMessage = async (content) => {
    addMessage(content, "user");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: content }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const data = await response.json();
      // Render response as markdown for bot messages
      addMessage(data.response, "bot");
    } catch (error) {
      addMessage("Error: Unable to connect to server.", "bot");
    } finally {
      setIsLoading(false);
    }
  };

  const exportChat = () => {
    const chatContent = messages
      .map(
        (msg) =>
          `${msg.sender.toUpperCase()} (${new Date(
            msg.timestamp
          ).toLocaleString()}): ${msg.content}`
      )
      .join("\n\n");
    const blob = new Blob([chatContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-lg shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-100">
          Chat Session
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={exportChat}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            title="Export chat"
          >
            <Download size={20} />
          </button>
          <button
            onClick={clearChat}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors"
            title="Clear chat"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="h-[500px] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && <LoadingIndicator />}
      </div>

      {/* Chat Input */}
      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
};

// -----------------------
// Main AIChat Component
// -----------------------
const AIChat = () => {
  // Global dark/light mode state
  const [isDark, setIsDark] = useState(false);
  const role = localStorage.getItem("role");
  // Global container and navigation classes
  const containerClasses = isDark
    ? "bg-gray-900 text-gray-100"
    : "bg-gray-100 text-gray-800";
  const navClasses = isDark
    ? "bg-gray-800 border-gray-700"
    : "bg-white border-gray-200";

  // Update document class for Tailwind dark mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <ChatProvider>
      <div className={`min-h-screen ${containerClasses} pt-[64px]`}>
        {/* Navigation Bar */}
        <Navbar
          isDark={isDark}
          setIsDark={setIsDark}
          dashboardType="chat"
          role={role}
        />

        {/* Main Chat Interface */}
        <main className="max-w-4xl mx-auto px-4 py-8">
          <ChatInterface />
        </main>
      </div>
    </ChatProvider>
  );
};

export default AIChat;
