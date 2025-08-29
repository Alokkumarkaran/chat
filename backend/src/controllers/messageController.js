const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');

exports.sendMessage = async (req, res, next) => {
  try {
    const { chatId, to, type = 'text', text = '', attachments = [] } = req.body;
    // ensure chat exists or create one
    let chat = await Chat.findById(chatId);
    if (!chat) {
      // create new chat with participants [from,to]
      chat = await Chat.create({ participants: [req.user._id, to] });
    }
    const msg = await Message.create({
      chat: chat._id,
      from: req.user._id,
      to,
      type,
      text,
      attachments
    });
    res.json({ ok: true, message: msg });
  } catch (err) {
    next(err);
  }
};

exports.getChatMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '50');
    const skip = (page - 1) * limit;
    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('from to', 'username uid avatar')
      .lean();
    res.json({ messages: messages.reverse() }); // return chronological
  } catch (err) {
    next(err);
  }
};

exports.editMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const msg = await Message.findById(id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    if (String(msg.from) !== String(req.user._id)) return res.status(403).json({ error: 'Not authorized' });
    msg.text = text;
    msg.isEdited = true;
    await msg.save();
    res.json({ ok: true, message: msg });
  } catch (err) {
    next(err);
  }
};

exports.deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { forEveryone } = req.query;
    const msg = await Message.findById(id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    if (String(msg.from) !== String(req.user._id) && !forEveryone) {
      // allow delete for self
      if (!msg.deletedFor.includes(req.user._id)) msg.deletedFor.push(req.user._id);
      await msg.save();
      return res.json({ ok: true });
    }
    if (forEveryone === 'true') {
      // wipe contents
      msg.text = '';
      msg.attachments = [];
      msg.deletedFor = msg.deletedFor.concat([msg.from, msg.to]);
      await msg.save();
      return res.json({ ok: true });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const msg = await Message.findById(id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    if (!msg.readBy.includes(req.user._id)) {
      msg.readBy.push(req.user._id);
      await msg.save();
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

exports.exportChat = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: 1 })
      .populate('from to', 'username uid')
      .lean();
    // flatten
    const rows = messages.map(m => ({
      timestamp: m.createdAt,
      from: m.from?.username || '',
      to: m.to?.username || '',
      type: m.type,
      text: m.text || '',
      attachments: (m.attachments || []).map(a => a.url).join(';')
    }));
    const parser = new Parser();
    const csv = parser.parse(rows);
    const fileName = `chat-${chatId}.csv`;
    res.header('Content-Type', 'text/csv');
    res.attachment(fileName);
    return res.send(csv);
  } catch (err) {
    next(err);
  }
};
