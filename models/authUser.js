const mongoose = require("mongoose");

// Use environment variables for configuration
const MONGODB_URL = process.env.MONGODB_URL || "mongodb://0.0.0.0:27017/shoppyuser";


// Connect to MongoDB
mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

// Handle connection events
const db = mongoose.connection;

db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

db.once('connected', () => {
  console.log('Connected to User MongoDB');
});

db.on('disconnected', () => {
  console.log('MongoDB disconnected. Reconnecting...');
  // You might want to implement reconnection logic here.
});


//ADDRESS SCHEMA

const addressSchema = new mongoose.Schema({

pincode:
{
    type:Number,
    required: true,
    trim: true
},
locality:
{
    type: String,
    required: true,
    trim: true
},
address:
{
    type: String,
    required: true,
    trim: true
},
district:
{
    type: String,
    required: true,
    trim: true
},
state:
{
    type: String,
    required: true,
    trim: true
},

landmark:
{
    type: String,
    required: true,
    trim: true
},
alternatephone:
{
    type: Number,
    required: true,
    trim: true
},   
addresstype:
{
    type: String,
    required: true,
    trim: true
}

});

// USER SCHEMA
const signupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  mobileNumber: {
    type: String,
    required: true,
    trim: true
  },
  userstatus: {
    type: Boolean,
    required: true
  },
  token: {
    type: String,
    default: ''
  },
  addresses: {
    type: [addressSchema], 
    default: []
  }
});

// User model
const authUser = mongoose.model('authUser', signupSchema);

module.exports = authUser;
