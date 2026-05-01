const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
  let projectIds = [];

  // If Member, only get stats for projects they are in
  if (req.user.role === 'Member') {
    const projects = await Project.find({ teamMembers: req.user.id });
    projectIds = projects.map(p => p._id);
  }

  // Filter tasks based on role
  const taskQuery = req.user.role === 'Admin' ? {} : { projectId: { $in: projectIds } };

  const totalTasks = await Task.countDocuments(taskQuery);
  const completedTasks = await Task.countDocuments({ ...taskQuery, status: 'Done' });
  const pendingTasks = await Task.countDocuments({ ...taskQuery, status: { $in: ['To Do', 'In Progress'] } });
  
  // Overdue tasks: Due date is before today and status is not 'Done'
  const today = new Date();
  const overdueTasks = await Task.countDocuments({
    ...taskQuery,
    dueDate: { $lt: today },
    status: { $ne: 'Done' }
  });

  const recentTasks = await Task.find(taskQuery)
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('projectId', 'title')
    .populate('assignedTo', 'name');

  res.status(200).json({
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    recentTasks
  });
});

module.exports = {
  getDashboardStats
};
