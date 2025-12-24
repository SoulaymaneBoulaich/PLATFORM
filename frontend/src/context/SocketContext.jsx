import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const { user, token } = useAuth();
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState(new Set());

    useEffect(() => {
        let newSocket;
        if (user && token) {
            // Initialize socket
            // Adjust URL if backend is on different port/host
            const SOCKET_URL = `http://${window.location.hostname}:3001`;
            newSocket = io(SOCKET_URL, {
                auth: { token },
                transports: ['websocket', 'polling'] // Force websocket/polling
            });

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
            });

            newSocket.on('user_online', (userId) => {
                setOnlineUsers(prev => new Set(prev).add(userId));
            });

            newSocket.on('user_offline', ({ userId }) => {
                setOnlineUsers(prev => {
                    const next = new Set(prev);
                    next.delete(userId);
                    return next;
                });
            });

            setSocket(newSocket);
        }

        return () => {
            if (newSocket) newSocket.disconnect();
        };
    }, [user, token]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
