const express = require('express');
const { body } = require('express-validator');
const { registerUser, loginUser, getMe, listCustomers } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules live in the route file (not the controller) so the
// "shape of a valid request" is visible right next to the route definition -
// easy to scan the whole API's input contract at a glance.
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.get('/me', protect, getMe);
router.get('/customers', protect, authorize('admin'), listCustomers);

module.exports = router;
