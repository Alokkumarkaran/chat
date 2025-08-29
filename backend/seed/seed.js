/**
 * Usage: node seed/seed.js
 * Make sure MONGO_URI is set in env or use .env file
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../src/config/db');
const User = require('../src/models/User');
const Chat = require('../src/models/Chat');
const Message = require('../src/models/Message');

const run = async () => {
  try {
    await connectDB();
    // wipe
    await Message.deleteMany({});
    await Chat.deleteMany({});
    await User.deleteMany({});

    const alice = await User.create({ username: 'alice', password: 'password123' });
    const bob = await User.create({ username: 'bob', password: 'password123' });

    const chat = await Chat.create({ participants: [alice._id, bob._id] });

    await Message.create({
      chat: chat._id,
      from: alice._id,
      to: bob._id,
      type: 'text',
      text: 'Hey Bob! This is a demo message.'
    });

    await Message.create({
      chat: chat._id,
      from: bob._id,
      to: alice._id,
      type: 'text',
      text: 'Hi Alice! Demo reply.'
    });

    console.log('Seeded demo users: alice / bob (password: password123)');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
