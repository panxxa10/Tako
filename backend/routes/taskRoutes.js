const express = require('express');
const { createTask, getTasksByDate, completeTask, deleteTask } = require('../controllers/taskController');
const verifyToken = require('../middleware/auth');

const router = express.Router();

router.post('/', verifyToken, createTask);
router.get('/:date', verifyToken, getTasksByDate);
router.patch('/:id/complete', verifyToken, completeTask);
router.delete('/:id', verifyToken, deleteTask);

module.exports = router;
