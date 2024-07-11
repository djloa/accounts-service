const express = require('express');
const router = express.Router();
// Import the Transaction model
const Transaction = require('../models/transaction');
const Account = require('../models/accounts');
const transactionService = require('../service/transactionService');
const auth = require('../auth');
const { body, validationResult } = require('express-validator');

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       required:
 *         - account
 *         - amount
 *         - transactionType
 *         - currency
 *       properties:
 *         account:
 *           type: string
 *           description: The account ID
 *           example: 60d0fe4f5311236168a109ca
 *         amount:
 *           type: number
 *           description: The transaction amount
 *           example: 50.0
 *         transactionType:
 *           type: string
 *           description: The type of transaction (INBOUND or OUTBOUND)
 *           example: INBOUND
 *         currency:
 *           type: string
 *           description: The currency code
 *           example: USD
 *         balance:
 *           type: number
 *           description: The updated balance after the transaction
 *           example: 150.0
 */

/**
 * @swagger
 * /transaction:
 *   post:
 *     summary: Create a new transaction
 *     security:
 *       - bearerAuth: []
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       200:
 *         description: The created transaction
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Validation error or insufficient funds
 *       404:
 *         description: Account not found
 *       500:
 *         description: Server error
 */
router.post('/transaction', auth.authenticateToken, auth.authorizeRole(['admin']), [
    body('account')
        .trim()
        .isString().withMessage('Account must be a string')
        .notEmpty().withMessage('Account cannot be empty')
        .escape(),
    body('amount')
        .isFloat({ min: 0 }).withMessage('Amount must be a non-negative number')
        .toFloat(),
    body('transactionType')
        .isIn(['INBOUND', 'OUTBOUND']).withMessage(`Transaction type must be one of: ${['INBOUND', 'OUTBOUND'].join(', ')}`)
        .notEmpty().withMessage('Transaction type cannot be empty')
        .escape(),
    body('currency')
        .trim()
        .isString().withMessage('Currency must be a string')
        .notEmpty().withMessage('Currency cannot be empty')
        .isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code')
        .escape()
], async (req, res) => {
    const account = await Account.findById(req.body.account);
    let balance;
    if (!account) return res.status(404).json({ message: 'Account not found' });

    if (req.body.transactionType === 'INBOUND') {
        const currencyBalance = account.balance.find(b => b.currency === req.body.currency);
        if (!currencyBalance) {
            account.balance.push({ amount: req.body.amount, currency: req.body.currency });
            balance = req.body.amount;
        } else {
            currencyBalance.amount += req.body.amount;
            balance = currencyBalance.amount;
        }
        await account.save();
    } else if (req.body.transactionType === 'OUTBOUND') {
        const currencyBalance = account.balance.find(b => b.currency === req.body.currency);
        if (!currencyBalance || currencyBalance.amount < req.body.amount) {
            return res.status(400).json({ message: 'Insufficient funds' });
        } else {
            currencyBalance.amount -= req.body.amount;
            balance = currencyBalance.amount;
        }
        await account.save();
    }
    const transaction = new Transaction({
        account: req.body.account,
        amount: req.body.amount,
        transactionType: req.body.transactionType,
        currency: req.body.currency,
        balance
    });
    await transactionService.publishTransactionEvent(transaction);
    try {
        const newTransaction = await transaction.save();
        res.status(200).json(newTransaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * @swagger
 * /transactions/{account}:
 *   get:
 *     summary: Get all transactions for a given account
 *     security:
 *       - bearerAuth: []
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: account
 *         schema:
 *           type: string
 *         required: true
 *         description: The account ID
 *     responses:
 *       200:
 *         description: A list of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Account not found
 *       500:
 *         description: Server error
 */
router.get('/transactions/:account', auth.authenticateToken, auth.authorizeRole(['admin']), async (req, res) => {
    try {
        const transactions = await Transaction.find({ account: req.params.account });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
