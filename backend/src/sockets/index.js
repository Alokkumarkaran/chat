const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Message = require('../models/Message');

const activeUsers = new Map(); // userId -> socketId(s) array

module.exports = (io) => {
  io.on('connection', (socket) => {
    // token auth on connect (client should send token)
    const { token } = socket.handshake.auth || {};
    if (!token) {
      // allow unauthenticated for public endpoints if needed; here we disconnect
      // socket.disconnect(true);
      return;
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
      // map user -> sockets
      const arr = activeUsers.get(userId) || new Set();
      arr.add(socket.id);
      activeUsers.set(userId, arr);

      // mark user online
      User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() }).exec();

      // notify friends/participants (we will emit presence to client side which chooses display)
      io.emit('user:online', { userId });

      // attach userId on socket
      socket.userId = userId;
    } catch (err) {
      console.warn('Socket auth failed', err.message);
      return;
    }

    // handle join chat room
    socket.on('chat:join', async ({ chatId }) => {
      socket.join(`chat:${chatId}`);
    });

    // typing
    socket.on('typing', ({ chatId, to }) => {
      socket.to(`chat:${chatId}`).emit('typing', { from: socket.userId, chatId });
    });

    // send message
    socket.on('message:send', async (payload, ack) => {
      try {
        /*
          payload expected:
          {
            chatId, to, type, text, attachments: [{url,name,size,mime}],
            autoDeleteAfterRead: optional boolean
          }
        */
        const { chatId, to, type='text', text='', attachments=[] } = payload;
        const msg = await Message.create({
          chat: chatId,
          from: socket.userId,
          to,
          type,
          text,
          attachments
        });

        // broadcast to chat room
        io.to(`chat:${chatId}`).emit('message:new', msg);

        // if recipient offline, we may send push (not implemented here)
        if (ack) ack({ ok: true, message: msg });
      } catch (err) {
        console.error('message:send err', err);
        if (ack) ack({ ok: false, error: err.message });
      }
    });

    // message read
    socket.on('message:read', async ({ chatId, messageId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return;
        if (!message.readBy.includes(socket.userId)) {
          message.readBy.push(socket.userId);
          await message.save();
        }
        // emit read receipt
        io.to(`chat:${chatId}`).emit('message:read', { messageId, userId: socket.userId });
        // optional auto-delete check
        const chat = await Chat.findById(chatId);
        const pairSetting = chat?.pairSettings?.get(String(socket.userId)) || { autoDeleteAfterRead: false };
        if (pairSetting.autoDeleteAfterRead) {
          // schedule immediate deletion for the reader's view
          message.deletedFor.push(socket.userId);
          await message.save();
          io.to(`chat:${chatId}`).emit('message:deletedFor', { messageId, userId: socket.userId });
        }
      } catch (err) {
        console.error(err);
      }
    });

    // message edit
    socket.on('message:edit', async ({ messageId, newText }) => {
      try {
        const msg = await Message.findById(messageId);
        if (!msg) return;
        if (String(msg.from) !== String(socket.userId)) return;
        msg.text = newText;
        msg.isEdited = true;
        await msg.save();
        io.to(`chat:${msg.chat}`).emit('message:edited', msg);
      } catch (err) {
        console.error(err);
      }
    });

    // message delete for everyone
    socket.on('message:delete', async ({ messageId, forEveryone=false }) => {
      try {
        const msg = await Message.findById(messageId);
        if (!msg) return;
        if (forEveryone) {
          msg.text = '';
          msg.attachments = [];
          msg.deletedFor = msg.deletedFor.concat([msg.from, msg.to]);
        } else {
          // delete for this user
          if (!msg.deletedFor.includes(socket.userId)) msg.deletedFor.push(socket.userId);
        }
        await msg.save();
        io.to(`chat:${msg.chat}`).emit('message:deleted', { messageId, forEveryone, userId: socket.userId });
      } catch (err) {
        console.error(err);
      }
    });

    // disconnect
    socket.on('disconnect', () => {
      try {
        const userId = socket.userId;
        if (!userId) return;
        const set = activeUsers.get(userId);
        if (set) {
          set.delete(socket.id);
          if (set.size === 0) {
            activeUsers.delete(userId);
            // set offline
            User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() }).exec();
            io.emit('user:offline', { userId, lastSeen: new Date() });
          } else {
            activeUsers.set(userId, set);
          }
        }
      } catch (err) {
        console.error(err);
      }
    });

  });
};
