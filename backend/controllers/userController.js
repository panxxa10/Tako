const Task = require('../models/Task');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');  // <- Asegúrate de importar el modelo User

const updateProfile = async (req, res) => {
  try {
    console.log('Cuerpo de la petición:', req.body);
    console.log('Archivo recibido:', req.file);
    
    const userId = req.user.id;

    // Buscamos el usuario
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    // Actualizamos los campos permitidos
    const { username, email, occupation } = req.body;

    if (username) user.username = username;
    if (email) user.email = email;
    if (occupation) user.occupation = occupation;

    // Si enviaron un archivo (avatar), guardamos la ruta y eliminamos la anterior si existe
    if (req.file) {
      // Ruta del avatar anterior
      if (user.avatar) {
        const oldPath = path.join(__dirname, '..', user.avatar);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      // Guardar nueva ruta
      user.avatar = `/uploads/${req.file.filename}`;
    }

    await user.save();

    res.json({ message: 'Perfil actualizado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error actualizando perfil', error: err.message });
  }
};

const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.find({ user: userId });

    const grouped = {};
    tasks.forEach(task => {
      const date = task.date.toISOString().split('T')[0];
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(task);
    });

    const completed = tasks.filter(t => t.completed).length;

    let streak = 0;
    let maxStreak = 0;
    let d = new Date();
    for (let i = 0; i < 365; i++) {
      const key = d.toISOString().split('T')[0];
      const dayTasks = grouped[key] || [];
      const anyDone = dayTasks.some(t => t.completed);
      if (anyDone) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      } else {
        if (streak > 0) break;
      }
      d.setDate(d.getDate() - 1);
    }

    const xp = completed * 10;
    const level = Math.floor(xp / 100) + 1;
    const xpInLevel = xp % 100;

    res.json({
      completed,
      streak,
      bestStreak: maxStreak,
      xp: xpInLevel,
      level,
      xpForNextLevel: 100,
      stickers: [
        ...(completed >= 10 ? [{ name: '10 tareas', img: '/stickers/10.png' }] : []),
        ...(streak >= 5 ? [{ name: 'Racha 5 días', img: '/stickers/streak5.png' }] : [])
      ]
    });
  } catch (err) {
    res.status(500).json({ message: 'Error calculando estadísticas', error: err.message });
  }
};

const getProfile = async (req, res) => { 
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const tasks = await Task.find({ user: userId });

    // Experiencia y nivel
    const completedTasksCount = tasks.filter(t => t.completed).length;
    const xp = completedTasksCount * 10;
    const level = Math.floor(xp / 100) + 1;
    const xpInLevel = xp % 100;
    const maxXp = 100;

    // Calcular racha de días consecutivos con tareas completadas
    const grouped = {};
    tasks.forEach(task => {
      const dateStr = task.date.toISOString().split('T')[0];
      if (!grouped[dateStr]) grouped[dateStr] = [];
      grouped[dateStr].push(task);
    });

    let streak = 0;
    let d = new Date();
    for (let i = 0; i < 365; i++) {
      const key = d.toISOString().split('T')[0];
      const dayTasks = grouped[key] || [];
      const anyDone = dayTasks.some(t => t.completed);
      if (anyDone) {
        streak++;
      } else {
        if (streak > 0) break;
      }
      d.setDate(d.getDate() - 1);
    }
    const stickers = [];

if (completedTasksCount >= 1) stickers.push({ name: 'Primera tarea', img: 'primera-tarea.png' });
if (completedTasksCount >= 10) stickers.push({ name: '10 tareas completadas', img: 'primeras10.png' });
if (streak >= 3) stickers.push({ name: 'Racha de 3 días', img: 'racha.png' });
if (level >= 2) stickers.push({ name: 'Nivel 2', img: 'nivel2.png' });
if (level >= 3) stickers.push({ name: 'Nivel 3', img: 'nivel3.png' });

    res.json({
      _id: user._id,
      username: user.username || '',    // <-- Agregado username
      email: user.email || '',          // <-- Agregado email
      name: user.name,
      occupation: user.occupation || '',
      avatar: user.avatar || '',
      completed: completedTasksCount,
      xp: xpInLevel,
      maxXp: maxXp,
      level: level,
      streak: streak,
      stickers,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error obteniendo perfil', error: err.message });
  }
};


module.exports = { getUserStats, getProfile, updateProfile };
