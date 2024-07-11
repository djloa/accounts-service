const express = require('express');
const router = express.Router();
// Import the Account model
const Account = require('../models/accounts');
const auth = require('../auth');
const { body, param, validationResult } = require('express-validator');



// Define a route to get all accounts
router.get('/accounts', auth.authenticateToken, auth.authorizeRole(['user', 'admin']), async (req, res) => {
  try {
    const accounts = await Account.find();
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Define a route to create an account
router.post('/accounts', auth.authenticateToken, auth.authorizeRole(['user', 'admin']), [
  // Validate and sanitize the owner field
  body('owner')
    .trim()
    .isString().withMessage('Owner must be a string')
    .notEmpty().withMessage('Owner cannot be empty')
    .escape(),

  // Validate and sanitize the balance array
  body('balance').isArray().withMessage('Balance must be an array'),
  body('balance.*.amount')
    .isFloat({ min: 0 }).withMessage('Amount must be a non-negative number')
    .toFloat(),
  body('balance.*.currency')
    .trim()
    .isString().withMessage('Currency must be a string')
    .notEmpty().withMessage('Currency cannot be empty')
    .isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code')
    .escape()
], async (req, res) => {
  const account = new Account({
    owner: req.body.owner,
    balance: req.body.balance,
  });
  try {
    const newAccount = await account.save();
    res.status(200).json(newAccount);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Define a route to update an account
router.put('/accounts/:id', auth.authenticateToken, auth.authorizeRole(['user', 'admin']), [
  // Validate and sanitize the id parameter
  param('id').isMongoId().withMessage('Invalid account ID'),

  // Validate and sanitize the owner field
  body('owner')
    .trim()
    .isString().withMessage('Owner must be a string')
    .notEmpty().withMessage('Owner cannot be empty')
    .escape(),

  // Validate and sanitize the balance array
  body('balance').isArray().withMessage('Balance must be an array'),
  body('balance.*.amount')
    .isFloat({ min: 0 }).withMessage('Amount must be a non-negative number')
    .toFloat(),
  body('balance.*.currency')
    .trim()
    .isString().withMessage('Currency must be a string')
    .notEmpty().withMessage('Currency cannot be empty')
    .isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code')
    .escape()
], async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) return res.status(404).json({ message: 'Account not found' });
    account.owner = req.body.owner;
    account.balance = req.body.balance;
    const updatedAccount = await account.save();
    res.json(updatedAccount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Define a route to get an account by ID
router.get('/accounts/:id', auth.authenticateToken, auth.authorizeRole(['user', 'admin']), [
  // Validate and sanitize the id parameter
  param('id').isMongoId().withMessage('Invalid account ID')
], async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Export the router to use it in other files
module.exports = router;