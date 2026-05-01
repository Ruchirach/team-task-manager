const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private
const getTasksByProject = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ projectId: req.params.projectId }).populate('assignedTo', 'name email');
  res.status(200).json(tasks);
});

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, projectId, dueDate } = req.body;

  if (!title || !projectId) {
    res.status(400);
    throw new Error('Please add title and project ID');
  }

  // Check if project exists
  const project = await Project.findById(projectId);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const task = await Task.create({
    title,
    description,
    assignedTo: assignedTo || null,
    projectId,
    dueDate,
    status: 'To Do'
  });

  const createdTask = await Task.findById(task._id).populate('assignedTo', 'name email');

  res.status(201).json(createdTask);
});

// @desc    Update task status or details
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  // Members can only update status. Admins can update anything.
  if (req.user.role !== 'Admin') {
    if (req.body.title || req.body.description || req.body.assignedTo || req.body.dueDate) {
      res.status(403);
      throw new Error('Not authorized to update task details, only status');
    }
  }

  const updatedTask = await Task.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  ).populate('assignedTo', 'name email');

  res.status(200).json(updatedTask);
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  await task.deleteOne();

  res.status(200).json({ id: req.params.id });
});

module.exports = {
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask
};
