const Chat = require('../models/Chat');

exports.setPairSetting = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { autoDeleteAfterRead } = req.body;
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    chat.pairSettings.set(String(req.user._id), { autoDeleteAfterRead: !!autoDeleteAfterRead });
    await chat.save();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

exports.getMySettings = async (req, res, next) => {
  try {
    // simple return user's settings
    res.json({ settings: req.user.settings || {} });
  } catch (err) {
    next(err);
  }
};
