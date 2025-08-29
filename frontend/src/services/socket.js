import { io } from 'socket.io-client';
import { getToken } from './api';

let socket = null;

export const connectSocket = () => {
  if (socket) return socket;
  const token = getToken();
  socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
    auth: { token },
    transports: ['websocket']
  });
  return socket;
};

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
  socket = null;
};

export const getSocket = () => socket;
