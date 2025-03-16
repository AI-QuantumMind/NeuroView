import React from 'react';
import PropTypes from 'prop-types';

export const ChatMessage = ({ message }) => {
  const isBot = message.sender === 'bot';
  
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isBot
            ? 'bg-blue-100 text-blue-900'
            : 'bg-blue-500 text-white'
        }`}
      >
        <p className="text-sm">{message.content}</p>
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
    sender: PropTypes.oneOf(['user', 'bot']).isRequired,
    timestamp: PropTypes.instanceOf(Date).isRequired,
  }).isRequired,
};