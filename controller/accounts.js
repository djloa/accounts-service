const express = require('express');
const router = express.Router();
// Import the Account model
const Account = require('../models/accounts');
const auth = require('../auth');
const { body, param, validationResult } = require('express-validator');

/**
 * /**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * @swagger
 * components:
 *   schemas:
 *     Balance:
 *       type: object
 *       required:
 *         - amount
 *         - currency
 *       properties:
 *         amount:
 *           type: number
 *           description: The balance amount
 *           example: 100.50
 *         currency:
 *           type: string
 *           description: The currency of the balance
 *           example: USD
 *     Account:
 *       type: object
 *       required:
 *         - owner
 *         - balance
 *       properties:
 *         owner:
 *           type: string
 *           description: The owner of the account
 *           example: John Doe
 *         balance:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Balance'
 */

/**
 * @swagger
 * /accounts:
 *   get:
 *     summary: Retrieve a list of accounts
 *     security:
 *       - bearerAuth: []
 *     tags: [Accounts]
 *     responses:
 *       200:
 *         description: A list of accounts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Account'
 *       500:
 *         description: Server error
 */
router.get('/accounts', auth.authenticateToken, auth.authorizeRole(['user', 'admin']), async (req, res) => {
  try {
    const accounts = await Account.find();
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /accounts:
 *   post:
 *     summary: Create a new account
 *     security:
 *       - bearerAuth: []
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Account'
 *     responses:
 *       200:
 *         description: The created account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/accounts', auth.authenticateToken, auth.authorizeRole(['user', 'admin']), [
  body('owner')
    .trim()
    .isString().withMessage('Owner must be a string')
    .notEmpty().withMessage('Owner cannot be empty')
    .escape(),
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

/**
 * @swagger
 * /accounts/{id}:
 *   put:
 *     summary: Update an account by ID
 *     security:
 *       - bearerAuth: []
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The account ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Account'
 *     responses:
 *       200:
 *         description: The updated account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Account not found
 *       500:
 *         description: Server error
 */
router.put('/accounts/:id', auth.authenticateToken, auth.authorizeRole(['user', 'admin']), [
  param('id').isMongoId().withMessage('Invalid account ID'),
  body('owner')
    .trim()
    .isString().withMessage('Owner must be a string')
    .notEmpty().withMessage('Owner cannot be empty')
    .escape(),
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

/**
 * @swagger
 * /accounts/{id}:
 *   get:
 *     summary: Retrieve an account by ID
 *     security:
 *       - bearerAuth: []
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The account ID
 *     responses:
 *       200:
 *         description: The account details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Account'
 *       404:
 *         description: Account not found
 *       500:
 *         description: Server error
 */
router.get('/accounts/:id', auth.authenticateToken, auth.authorizeRole(['user', 'admin']), [
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

module.exports = router;
