const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs'); // 👈 necesario para crear carpetas

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const app = express();

// ✅ Crear carpeta uploads/avatars si no existe
const avatarsPath = path.join(__dirname, 'uploads', 'avatars');
if (!fs.existsSync(avatarsPath)) {
  fs.mkdirSync(avatarsPath, { recursive: true });
}

app.use(cors());
app.use(express.json());

// ✅ Hacer pública la carpeta de imágenes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
  })
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));



