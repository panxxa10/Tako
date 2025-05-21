const Task = require('../models/Task');

const createTask = async (req, res) => {
  try {
    const { title, description, date } = req.body;
    const task = await Task.create({
      title,
      description,
      date,
      user: req.user.id
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error creando tarea', error: err.message });
  }
};

const getTasksByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const tasks = await Task.find({ 
      user: req.user.id,
      date: new Date(date)
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error obteniendo tareas', error: err.message });
  }
};

const completeTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { completed: true },
      { new: true }
    );
    if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error completando tarea', error: err.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });
    res.json({ message: 'Tarea eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error eliminando tarea', error: err.message });
  }
};

module.exports = { createTask, getTasksByDate, completeTask, deleteTask };
