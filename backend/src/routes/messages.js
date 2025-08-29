const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { sendMessage, getChatMessages, editMessage, deleteMessage, markRead, exportChat } = require('../controllers/messageController');

router.post('/send', auth, sendMessage);
router.get('/chat/:chatId', auth, getChatMessages); // paginated
router.put('/:id', auth, editMessage);
router.delete('/:id', auth, deleteMessage);
router.post('/:id/read', auth, markRead);
router.get('/export/:chatId', auth, exportChat);

module.exports = router;
