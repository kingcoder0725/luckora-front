import io from 'socket.io-client';
import { API_URL } from 'src/config-global';

export const mainSocket = io(`${API_URL}`, {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});
export const sportsSocket = io(`${API_URL}/sports`, {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});
export const chatSocket = io(`${API_URL}/chat`, {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

chatSocket.on('connect', () => {
  console.log('[CHAT] 🟢 Socket connected:', chatSocket.id);
});

chatSocket.on('disconnect', (reason) => {
  console.log('[CHAT] 🔴 Socket disconnected:', reason);
});

chatSocket.on('connect_error', (error) => {
  console.log('[CHAT] ❌ Connection error:', error);
});

export const journeySocket = io(`${API_URL}/journey`, {
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});


export const sockets = [mainSocket, sportsSocket, chatSocket, journeySocket];

export const authenticateSockets = (token: string) => {
  console.log(`[WS] 🔑 Authenticating with token: ${token.substring(0, 10)}...`);
  sockets.forEach((socket, index) => {
    console.log(`[WS] 📤 Sending auth to socket ${index} (connected: ${socket.connected})`);
    socket.emit('auth', token);
  });
  
  console.log('[CHAT] 🔑 Chat socket auth sent. Connected:', chatSocket.connected);
};