import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';
import API, { getToken, logout } from '../services/api';

export default function Chat(){
  const [activeChat, setActiveChat] = useState(null);
  const [me, setMe] = useState(null);

  useEffect(() => {
    // set token header if exists
    const token = getToken();
    if (!token) return;
    API.get('/api/auth/me').then(res => setMe(res.data.user)).catch(() => logout());
    const s = connectSocket();
    s.on('connect', ()=> console.log('socket connected'));
    s.on('disconnect', ()=> console.log('socket disconnected'));
    return () => disconnectSocket();
  }, []);

  return (
    <div className="h-screen grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5">
      <div className="md:col-span-1 lg:col-span-1 border-r">
        <Sidebar onChatSelect={setActiveChat} me={me} />
      </div>
      <div className="md:col-span-3 lg:col-span-4">
        <ChatWindow chat={activeChat} me={me} />
      </div>
    </div>
  );
}
