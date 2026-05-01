const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = asyncHandler(async (req, res) => {
  // If Admin, see all projects. If Member, see assigned projects.
  let projects;
  if (req.user.role === 'Admin') {
    projects = await Project.find().populate('teamMembers', 'name email');
  } else {
    projects = await Project.find({ teamMembers: req.user.id }).populate('teamMembers', 'name email');
  }
  res.status(200).json(projects);
});

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = asyncHandler(async (req, res) => {
  const { title, description, teamMembers } = req.body;

  if (!title || !description) {
    res.status(400);
    throw new Error('Please add title and description');
  }

  const project = await Project.create({
    title,
    description,
    teamMembers: teamMembers || [],
    createdBy: req.user.id
  });

  const createdProject = await Project.findById(project._id).populate('teamMembers', 'name email');

  res.status(201).json(createdProject);
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Delete all tasks associated with the project
  await Task.deleteMany({ projectId: project._id });
  
  await project.deleteOne();

  res.status(200).json({ id: req.params.id });
});

// @desc    Get a single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id).populate('teamMembers', 'name email');

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  res.status(200).json(project);
});

module.exports = {
  getProjects,
  getProject,
  createProject,
  deleteProject
};
