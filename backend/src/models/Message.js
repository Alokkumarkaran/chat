const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['text','image','audio','video','file','voice'], default: 'text' },
  text: { type: String, default: '' },
  attachments: [{ url: String, name: String, size: Number, mime: String }],
  isEdited: { type: Boolean, default: false },
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // deleted for which users
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // read receipts
  createdAt: { type: Date, default: Date.now },
  autoDeleteAt: { type: Date, default: null }
});

MessageSchema.index({ chat: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);
