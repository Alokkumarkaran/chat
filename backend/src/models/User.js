const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
  password: { type: String, required: true },
  uid: { type: String, default: () => uuidv4().replace(/-/g, '').slice(0, 12), unique: true },
  avatar: { type: String, default: '' },
  blocked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // users this user blocked
  createdAt: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: null },
  isOnline: { type: Boolean, default: false },
  pushSubscriptions: { type: Array, default: [] }, // push subscription objects for web push
  settings: {
    autoDeleteAfterRead: { type: Boolean, default: false }
  }
});

// hash before save
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
