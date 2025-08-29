import React from 'react';
import { formatTime } from '../utils/format';

export default function MessageBubble({ message, meId }) {
  const isMe = message.from === meId || (message.from?._id === meId);
  const text = message.text || '';
  return (
    <div className={`mb-3 flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`${isMe ? 'bg-primary text-white' : 'bg-gray-100 text-black'} p-3 rounded-lg max-w-[70%]`}>
        <div className="text-sm">{text}</div>
        <div className="text-xs text-gray-200 mt-1 flex justify-end">
          {formatTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
}
