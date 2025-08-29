const User = require('../models/User');

exports.searchUser = async (req, res, next) => {
  try {
    const q = req.query.q;
    if (!q) return res.status(400).json({ error: 'Query param q required' });
    // search by username or uid exact/partial
    const regex = new RegExp(q, 'i');
    const users = await User.find({ $or: [{ username: regex }, { uid: regex }] }).select('-password -pushSubscriptions');
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

exports.blockUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const me = req.user;
    if (String(me._id) === String(targetId)) return res.status(400).json({ error: 'Cannot block yourself' });
    if (!me.blocked.includes(targetId)) {
      me.blocked.push(targetId);
      await me.save();
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

exports.unblockUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const me = req.user;
    me.blocked = me.blocked.filter(id => String(id) !== String(targetId));
    await me.save();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

exports.subscribePush = async (req, res, next) => {
  try {
    const subscription = req.body;
    const me = req.user;
    // naive dedupe by endpoint
    const exists = me.pushSubscriptions?.some(s => s.endpoint === subscription.endpoint);
    if (!exists) {
      me.pushSubscriptions.push(subscription);
      await me.save();
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
