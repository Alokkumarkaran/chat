const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { setPairSetting, getMySettings } = require('../controllers/settingsController');

router.post('/pair/:chatId', auth, setPairSetting);
router.get('/me', auth, getMySettings);

module.exports = router;
