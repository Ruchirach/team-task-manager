const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  // Validate name (starts with letter, no numbers/special chars at the beginning)
  const nameRegex = /^[a-zA-Z]/;
  if (!nameRegex.test(name)) {
    res.status(400);
    throw new Error('Name must start with a letter and cannot begin with a number or special character');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    throw new Error('Please enter a valid email address format (e.g. user@example.com)');
  }

  // Check if name is unique
  const nameTaken = await User.findOne({ name });
  if (nameTaken) {
    res.status(400);
    throw new Error('Name is already taken. Please choose a unique name.');
  }

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Check if trying to register as Admin, ensure only one Admin exists
  if (role === 'Admin') {
    const adminExists = await User.findOne({ role: 'Admin' });
    if (adminExists) {
      res.status(400);
      throw new Error('An Admin already exists. Only one Admin is allowed per system.');
    }
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'Member'
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(req.user);
});

// @desc    Get all users (for assigning tasks/projects)
// @route   GET /api/auth/users
// @access  Private
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.status(200).json(users);
});

module.exports = {
  registerUser,
  loginUser,
  getMe,
  getUsers
};
