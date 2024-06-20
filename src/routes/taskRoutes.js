const express = require('express')
const router = express.Router()
const { authenticate } = require('../utils/middleware')
const { getTasks, getTaskById, createTask, updateTask, deleteTask, getProjectTasks, getUserTasks, addUserToTask, removeUserFromTask, transformAndScheduleTasks, getTaskUsers, sendFeedback } = require('../controllers/taskController')

router.get('/', authenticate, getTasks)
router.get('/:id', authenticate, getTaskById)
router.post('/', authenticate, createTask)
router.put('/:id', authenticate, updateTask)
router.delete('/:id', authenticate, deleteTask)
router.get('/:id/users', authenticate, getTaskUsers)
router.get('/project/:projectId', authenticate, getProjectTasks)
router.get('/user/:userId', authenticate, getUserTasks)
router.post('/:taskId/users/:userId', authenticate, addUserToTask)
router.delete('/:taskId/users/:userId', authenticate, removeUserFromTask)
router.post('/schedule/:projectId', authenticate, transformAndScheduleTasks)
router.post('/feedback/:projectId', authenticate, sendFeedback)

module.exports = router
