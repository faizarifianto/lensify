const express = require('express');
const router = express.Router();
const { register, login, googleLogin, getMe, updateProfile } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/me', authMiddleware, getMe);
router.put('/profile', authMiddleware, upload.single('avatar'), updateProfile);

module.exports = router;
