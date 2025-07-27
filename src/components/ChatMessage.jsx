import React from 'react';

export default function ChatMessage({ sender, text }) {
  const isUser = sender === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} my-2`}>
      <div
        className={`max-w-[75%] px-5 py-3 rounded-3xl shadow-lg text-base whitespace-pre-line break-words font-sfpro transition-all
          ${isUser ? 'bg-gradient-to-br from-sky-500 to-sky-400 text-white rounded-br-2xl' : 'bg-white/90 text-gray-900 rounded-bl-2xl border border-gray-200'}
        `}
        style={{boxShadow: '0 2px 12px 0 rgba(0,0,0,0.04)'}}
      >
        {text}
      </div>
    </div>
  );
} 