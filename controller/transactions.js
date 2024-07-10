const express = require('express');
const router = express.Router();
// Import the Transaction model
const Transaction = require('../models/transaction');
const Account = require('../models/accounts');
const transactionService = require('../service/transactionService');
const auth = require('../auth');



// Define a route to create a transaction
router.post('/transaction', auth.authenticateToken, auth.authorizeRole(['admin']), async (req, res) => {
    const account = await Account.findById(req.body.account);
    let balance;
    if (!account) return res.status(404).json({ message: 'Account not found' });
    // increases / decreases the balance of the account based on the transaction type
    if (req.body.transactionType === 'INBOUND') {
        const currencyBalance = account.balance.find(b => b.currency === req.body.currency);
        if (!currencyBalance) {
            account.balance.push({ amount: req.body.amount, currency: req.body.currency });
            balance = req.body.amount;
        } else {
            currencyBalance.amount += req.body.amount;
            balance = currencyBalance.amount
        }
        await account.save();
    } else if (req.body.transactionType === 'OUTBOUND') {
        const currencyBalance = account.balance.find(b => b.currency === req.body.currency);
        if (!currencyBalance || currencyBalance.amount < req.body.amount) {
            return res.status(400).json({ message: 'Insufficient funds' });
        } else {
            currencyBalance.amount -= req.body.amount;
            balance = currencyBalance.amount
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

// Define a route to get all transactions for a given account
router.get('/transactions/:account', auth.authenticateToken, auth.authorizeRole(['admin']), async (req, res) => {
    try {
        const transactions = await Transaction.find({ account: req.params.account });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;