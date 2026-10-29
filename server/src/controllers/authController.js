const { validationResult } = require('express-validator');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');

// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }

  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'A user with this email already exists' });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'customer',
  });

  const token = generateToken(user._id, user.role);

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
  });
});

// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }

  const { email, password } = req.body;


  const user = await User.findOne({ email }).select('+password');


  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = generateToken(user._id, user.role);

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
  });
});

// @route   GET /api/auth/me
// @access  Private (requires valid JWT)
const getMe = asyncHandler(async (req, res) => {
  // req.user was attached by the `protect` middleware
  res.status(200).json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
});

const listCustomers = asyncHandler(async(req,res)=>{
  const customers = await User.find({role:'customer'})
    .select('name email')
    .sort({name: 1})
  res.status(200).json(customers);
});
module.exports = { registerUser, loginUser, getMe, listCustomers };
