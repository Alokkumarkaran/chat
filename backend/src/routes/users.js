const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { searchUser, blockUser, unblockUser, subscribePush } = require('../controllers/userController');

router.get('/search', auth, searchUser); // ?q=username_or_uid
router.post('/block/:id', auth, blockUser);
router.post('/unblock/:id', auth, unblockUser);
router.post('/push/subscribe', auth, subscribePush);

module.exports = router;
