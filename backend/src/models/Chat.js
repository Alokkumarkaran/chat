const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  createdAt: { type: Date, default: Date.now },
  // per-pair settings (stored as map of userId -> settings)
  pairSettings: {
    type: Map,
    of: new mongoose.Schema({
      autoDeleteAfterRead: { type: Boolean, default: false }
    }),
    default: {}
  }
});

ChatSchema.index({ participants: 1 });

module.exports = mongoose.model('Chat', ChatSchema);
