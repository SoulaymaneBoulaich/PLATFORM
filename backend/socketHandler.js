const socketIo = require('socket.io');
const jwt = require('jsonwebtoken'); // Assuming you use JWT for auth
const Message = require('./models/Message');
const User = require('./models/User'); // For updating presence if needed

let io;
const onlineUsers = new Map(); // userId -> socketId

const initSocket = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "*", // Adjust this to match your frontend URL in production
            methods: ["GET", "POST"]
        }
    });

    io.use(async (socket, next) => {
        // Simple auth middleware (expand based on your actual auth logic)
        const token = socket.handshake.auth.token;
        if (token) {
            try {
                // Verify token (replacing SECRET with your actual env var)
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.user = decoded;
                next();
            } catch (err) {
                next(new Error('Authentication error'));
            }
        } else {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.user_id}`);

        const userId = socket.user.user_id;
        onlineUsers.set(userId, socket.id);

        // Broadcast user online status
        socket.broadcast.emit('user_online', userId);

        // Join Conversation Room
        socket.on('join_conversation', (conversationId) => {
            socket.join(`conversation_${conversationId}`);
            console.log(`User ${userId} joined conversation ${conversationId}`);
        });

        // Leave Conversation Room
        socket.on('leave_conversation', (conversationId) => {
            socket.leave(`conversation_${conversationId}`);
            console.log(`User ${userId} left conversation ${conversationId}`);
        });

        // Send Message
        socket.on('send_message', async (data) => {
            // data should include: conversationId, content, mediaUrl, mediaType
            try {
                // Determine delivered status: is the recipient in the room?
                // This is a simplification. Ideally, check if recipient socket is online.
                const { conversationId, content, mediaUrl, mediaType, recipientId } = data;

                // You might want to persist the message via REST API first, 
                // but if using socket-only flow:
                /* 
                const messageId = await Message.create({
                    conversationId, 
                    senderId: userId, 
                    content, 
                    mediaUrl, 
                    mediaType
                });
                */

                // Assuming message is already saved via REST and we are just notifying, 
                // OR we save it here. The plan said "validate sender, persist message".

                // Receive message_id from the client (who called the API first)
                // OR duplicate logic if we want to keep socket-only (but we are prioritizing API persistence now)

                let messageId = data.message_id;

                /* 
                   REMOVED DUPLICATE CREATION
                   The frontend now calls the API to create the message first, 
                   then emits this event with the message_id.
                */
                // const messageId = await Message.create({ ... });

                // Construct message data for broadcast
                const messageData = {
                    message_id: messageId,
                    conversation_id: conversationId,
                    sender_id: userId,
                    content,
                    media_url: mediaUrl,
                    media_type: mediaType || 'TEXT',
                    created_at: new Date(),
                    status: 'sent'
                };

                // Emit to room (including sender, or exclude sender appropriately)
                io.to(`conversation_${conversationId}`).emit('message_received', messageData);

                // Confirm to sender (ack)
                socket.emit('message_sent', { tempId: data.tempId, message_id: messageId, status: 'sent' });

            } catch (err) {
                console.error('Socket send_message error:', err);
                socket.emit('message_error', { error: 'Failed to send message' });
            }
        });

        // Typing Indicators
        socket.on('typing_start', (conversationId) => {
            socket.to(`conversation_${conversationId}`).emit('typing_start', { conversationId, userId });
        });

        socket.on('typing_stop', (conversationId) => {
            socket.to(`conversation_${conversationId}`).emit('typing_stop', { conversationId, userId });
        });

        // Mark Read
        socket.on('mark_read', async ({ conversationId, messageIds }) => {
            try {
                if (messageIds && messageIds.length > 0) {
                    await Message.markAsReadForUser(messageIds, userId);
                    // Notify others in room that these messages were read
                    io.to(`conversation_${conversationId}`).emit('messages_read', { conversationId, messageIds, userId });
                }
            } catch (err) {
                console.error('Socket mark_read error:', err);
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${userId}`);
            onlineUsers.delete(userId);
            // Broadcast user offline
            socket.broadcast.emit('user_offline', { userId, lastSeen: new Date() });
        });
    });
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

module.exports = { initSocket, getIo };
