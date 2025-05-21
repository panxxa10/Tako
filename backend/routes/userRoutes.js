const express = require('express');
const multer = require('multer');
const path = require('path');
const { getUserStats, getProfile, updateProfile } = require('../controllers/userController');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Configurar multer para guardar en uploads/avatars con nombres únicos y extensión
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/avatars'); // carpeta específica para avatares
  },
  filename: function(req, file, cb) {
    // Generar nombre único con extensión original
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});

const upload = multer({ storage });

router.get('/stats', verifyToken, getUserStats);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, upload.single('avatar'), updateProfile); // multer para avatar

module.exports = router;
