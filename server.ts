import { createServer } from 'http';
import { parse } from 'url';
import prisma from '@prisma/client';
import next from 'next';
import { redis } from '@/lib/redis';
import { Server as SocketIOServer } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const PRESENCE_TTL = 90;

// Store online users: { userId: { socketId, role, name } }
const onlineUsers = new Map<
  string,
  {
    socketId: Set<string>;
    name: string;
    role: string;
    lastPing: number;
  }
>();
// Store typing status: { conversationId: userId[] }
const typingUsers = new Map<string, Set<string>>();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req?.url || '', true);
    
    // Skip Next.js handler for socket.io requests
    if (parsedUrl.pathname?.startsWith('/socket.io')) {
      return;
    }
    
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling']
  });

  io.on('connection', (socket: import('socket.io').Socket) => {
    console.log('User connected:', socket.id);
    

    // User joins with their info
    socket.on('user:join', async ({ userId, role, name }) => {
      await redis.sadd(`presence:sockets:${userId}`, socket.id);
      await redis.set(`presence:${userId}`, "online", "EX", PRESENCE_TTL);
      
      let user = onlineUsers.get(userId);

      if (!user) {
        user = {
          socketId: new Set(),
          role,
          name,
          lastPing: Date.now(),
        };
        onlineUsers.set(userId, user);
      
        // Join personal room
        socket.join(`user:${userId}`);
      
        // FIRST connection → broadcast online
        const socketCount = await redis.scard(`presence:sockets:${userId}`);
        if (socketCount === 1) {
          io.emit("presence:update", { 
            userId, 
            status: "online", 
            name 
          });
        }
      }

      // Send current online users to the newly connected user
      const onlineUsersList = Array.from(onlineUsers.entries()).map(([id, data]) => ({
        userId: id,
        ...data,
        status: 'online'
      }));
      socket.emit('presence:list', onlineUsersList);
      
      console.log(`User ${name} (${userId}) joined`);

      user.socketId.add(socket.id);
      user.lastPing = Date.now();

      socket.data.userId = userId;
      socket.join(`user:${userId}`);
    });

    // Handle ping status
    socket.on('presence:ping', () => {
      const userId = socket.data.userId;
      const user = onlineUsers.get(userId);
      if (user) user.lastPing = Date.now();
    });

    // Join a conversation room
    socket.on('conversation:join', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // Leave a conversation room
    socket.on('conversation:leave', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Handle new message
    socket.on('message:send', (data: {
      conversationId: string;
      senderId: string;
      recipientId: string;
      content: string;
      messageId: string;
      senderName: string;
      createdAt: string;
    }) => {
      // Broadcast to conversation room
      io.to(`conversation:${data.conversationId}`).emit('message:receive', data);
      
      // Also notify recipient directly if they're online
      const recipientData = onlineUsers.get(data.recipientId);
      if (recipientData) {
        io.to(`user:${data.recipientId}`).emit('message:notification', {
          conversationId: data.conversationId,
          senderId: data.senderId,
          senderName: data.senderName,
          preview: data.content.substring(0, 50)
        });
      }
    });

    // Handle typing indicator
    socket.on('typing:start', (data: { conversationId: string; userId: string; userName: string }) => {
      if (!typingUsers.has(data.conversationId)) {
        typingUsers.set(data.conversationId, new Set());
      }
      typingUsers.get(data.conversationId)!.add(data.userId);
      
      socket.to(`conversation:${data.conversationId}`).emit('typing:update', {
        conversationId: data.conversationId,
        userId: data.userId,
        userName: data.userName,
        isTyping: true
      });
    });

    socket.on('typing:stop', (data: { conversationId: string; userId: string }) => {
      if (typingUsers.has(data.conversationId)) {
        typingUsers.get(data.conversationId)!.delete(data.userId);
      }
      
      socket.to(`conversation:${data.conversationId}`).emit('typing:update', {
        conversationId: data.conversationId,
        userId: data.userId,
        isTyping: false
      });
    });

    // Handle message read
    socket.on('message:read', (data: { conversationId: string; userId: string; messageIds: string[] }) => {
      io.to(`conversation:${data.conversationId}`).emit('message:read:update', data);
    });

    // Handle message edit
    socket.on('message:edit', (data: {
      messageId: string;
      conversationId: string;
      newContent: string;
      editedAt: string;
    }) => {
      io.to(`conversation:${data.conversationId}`).emit('message:edited', data);
    });

    // Handle message delete
    socket.on('message:delete', (data: {
      messageId: string;
      conversationId: string;
      deletedAt: string;
    }) => {
      io.to(`conversation:${data.conversationId}`).emit('message:deleted', data);
    });

    // Handle last seen update
    socket.on('user:update-last-seen', async (userId: string) => {
      // Broadcast to all connected clients
      io.emit('user:last-seen-updated', {
        userId,
        lastSeen: new Date().toISOString()
      });
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      const userId = socket.data.userId;
      if (!userId) return;

      const user = onlineUsers.get(userId);
      if (!user) return;

      user.socketId.delete(socket.id);

      await redis.srem(`presence:sockets:${userId}`, socket.id);

      // Kalau masih ada socket lain → masih online
      if (user.socketId.size > 0) return;

      // BENAR-BENAR offline
      onlineUsers.delete(userId);

      await redis.del(`presence:${userId}`);
      await prisma.user.update({
        where: { id: userId },
        data: { lastSeen: new Date() },
      });

      io.emit('presence:update', {
        userId,
        status: 'offline',
        name: user.name,
      });
    });
  });

  setInterval(async () => {
    const now = Date.now();

    for (const [userId, user] of onlineUsers) {
      if (now - user.lastPing > 90_000) {
        onlineUsers.delete(userId);

        await prisma.user.update({
          where: { id: userId },
          data: { lastSeen: new Date(user.lastPing) },
        });

        io.emit('presence:update', {
          userId,
          status: 'offline',
          name: user.name,
        });
      }
    }
  }, 60_000);

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log('> Socket.IO server is running');
  });
});

