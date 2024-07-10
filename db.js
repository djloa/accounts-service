const mongoose = require('mongoose');
const dotenv = require('dotenv');

async function dbConnect() {
    

// Load environment variables from a .env file
dotenv.config();

// Get the MongoDB connection string from environment variables
const dbURI = process.env.MONGODB_URI
//mongodb+srv://djloa94@gmail.com:Mariadoscavalos94@cluster41302.0wibtew.mongodb.net/?retryWrites=true&w=majority&appName=Cluster41302

// Connect to MongoDB
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Export the connection

}

module.exports = { dbConnect, mongoose }