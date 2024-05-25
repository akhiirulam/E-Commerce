const mongoose = require('mongoose');

const MONGODB_URL = process.env.MONGODB_URL || "mongodb://0.0.0.0:27017/shoppyuser";

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

const wishListSchema = new mongoose.Schema({
    bookId : { type: String, required: true },
    email: { type: String, required: true, trim: true},
  });

const wishListDb = mongoose.model('userWishList',wishListSchema);
module.exports = wishListDb;