const mongoose = require('mongoose');


// Define the Accounts schema. Simplified for brevity
const AccountsSchema = new mongoose.Schema({
  owner: {
    type: String,
    required: true
  },
  balance: [{
    amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true
  }}],
});

// Create and export the Account model
module.exports = mongoose.model('Account', AccountsSchema);