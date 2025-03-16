import React from 'react';
import { Download, Trash2 } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { LoadingIndicator } from './LoadingIndicator';

export const ChatInterface = () => {
  const { messages, addMessage, clearChat, isLoading, setIsLoading } = useChat();

  const handleSendMessage = async (content) => {
    addMessage(content, 'user');
    setIsLoading(true);

    try {
      // Simulate API call - Replace with actual API integration
      const response = await new Promise((resolve) => 
        setTimeout(() => resolve({ data: { response: "This is a simulated response. Replace with actual API integration." }}), 1000)
      );
      addMessage(response.data.response, 'bot');
    } catch (error) {
      addMessage("Sorry, I'm having trouble connecting to the server. Please try again later.", 'bot');
    } finally {
      setIsLoading(false);
    }
  };

  const exportChat = () => {
    const chatContent = messages
      .map((msg) => `${msg.sender.toUpperCase()} (${new Date(msg.timestamp).toLocaleString()}): ${msg.content}`)
      .join('\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-700">Chat Session</h2>
        <div className="flex space-x-2">
          <button
            onClick={exportChat}
            className="p-2 text-gray-600 hover:text-blue-500 transition-colors"
            title="Export chat"
          >
            <Download size={20} />
          </button>
          <button
            onClick={clearChat}
            className="p-2 text-gray-600 hover:text-red-500 transition-colors"
            title="Clear chat"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="h-[500px] overflow-y-auto p-4 bg-gray-50">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isLoading && <LoadingIndicator />}
      </div>

      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
    </div>
  );
};