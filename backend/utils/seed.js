const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const connectDB = require('../config/db');

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();

    // Create users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'Admin',
    });

    const member1 = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: hashedPassword,
      role: 'Member',
    });

    const member2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: hashedPassword,
      role: 'Member',
    });

    // Create a project
    const project = await Project.create({
      title: 'Website Redesign',
      description: 'Overhaul the corporate website with a modern look and feel.',
      createdBy: adminUser._id,
      teamMembers: [member1._id, member2._id],
    });

    // Create tasks
    await Task.create([
      {
        title: 'Design Mockups',
        description: 'Create Figma mockups for the homepage.',
        status: 'Done',
        assignedTo: member1._id,
        projectId: project._id,
        dueDate: new Date(Date.now() - 86400000 * 2), // 2 days ago
      },
      {
        title: 'Develop Homepage',
        description: 'Implement the homepage using React and Tailwind.',
        status: 'In Progress',
        assignedTo: member2._id,
        projectId: project._id,
        dueDate: new Date(Date.now() + 86400000 * 5), // 5 days from now
      },
      {
        title: 'Setup Backend API',
        description: 'Create REST endpoints for the new features.',
        status: 'To Do',
        assignedTo: member1._id,
        projectId: project._id,
        dueDate: new Date(Date.now() + 86400000 * 10),
      },
      {
        title: 'Update Logo',
        description: 'Redesign the company logo.',
        status: 'To Do',
        projectId: project._id,
        dueDate: new Date(Date.now() - 86400000 * 1), // Overdue
      }
    ]);

    console.log('Database Seeded Successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error with seeding: ${error}`);
    process.exit(1);
  }
};

seedDatabase();
