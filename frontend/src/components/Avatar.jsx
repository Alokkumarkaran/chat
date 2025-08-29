import React from 'react';

export default function Avatar({ src, username, size = 40 }) {
  if (src) return <img src={src} alt={username} className="rounded-full" style={{ width: size, height: size }} />;
  return <div className="rounded-full bg-gray-300 flex items-center justify-center" style={{ width: size, height: size }}>{(username||'U')[0].toUpperCase()}</div>;
}
