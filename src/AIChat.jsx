import React from 'react';
import { MessageSquare } from 'lucide-react';
import { ChatProvider } from './context/ChatContext';
import { ChatInterface } from './components/ChatInterface';

function AIChat() {
  return (
    <ChatProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="text-blue-500" size={24} />
              <h1 className="text-xl font-semibold text-gray-900">Medical Assistant</h1>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">
          <ChatInterface />
        </main>
      </div>
    </ChatProvider>
  );
}

export default AIChat;