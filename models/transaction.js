const mongoose = require('mongoose');

const transactionType = ['INBOUND', 'OUTBOUND'];

// Define the Transaction schema. Simplified for brevity
const TransactionSchema = new mongoose.Schema({
    // Id of the account involved in the transaction
    account: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    transactionType: {
        type: String,
        enum: transactionType,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    currency: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
});
//arn:aws:logs:eu-north-1:471112601756:log-group:/aws/events/transactions
module.exports = mongoose.model('Transaction', TransactionSchema)