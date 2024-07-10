// Import necessary modules
const express = require('express');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const db = require('./db.js');

// Load environment variables from a .env file
dotenv.config();

// Create an instance of express
const app = express();

// Creating a rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply the rate limiter to all requests
app.use(limiter);

// Define a port to listen on
const PORT = process.env.PORT || 8080;


// Get the MongoDB connection string from environment variables
db.dbConnect();

// Middleware to parse JSON bodies
app.use(express.json());

// Define a route handler for the default home page
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Import the routes
const accountsController = require('./controller/accounts');
const transactionsController = require('./controller/transactions');
const loginController = require('./controller/login');

app.use('/', accountsController);
app.use('/', transactionsController);
app.use('/', loginController);
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});