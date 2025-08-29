const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/uploadMulter');
const { uploadFile } = require('../controllers/uploadController');

router.post('/file', auth, upload.array('files', 6), uploadFile);

module.exports = router;
