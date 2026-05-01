const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  deleteProject
} = require('../controllers/projectController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getProjects)
  .post(protect, admin, createProject);

router.route('/:id')
  .get(protect, getProject)
  .delete(protect, admin, deleteProject);

module.exports = router;
