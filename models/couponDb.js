const mongoose = require("mongoose");

const MONGODB_URL = process.env.MONGODB_URL || "mongodb://0.0.0.0:27017/shoppyuser";

mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

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

const couponSchema = new mongoose.Schema({
    
    couponCode: {
        type: String,
        required: true,
        trim: true,
      },
      couponPercentage: {
        type: Number,
        required: true,
        trim: true,
      },
      couponType: {
        type: String,
        required: true,
        trim: true,
      },
      couponValidity: {
        type: Date,
        required: true,
        trim: true,
      },
});


const couponDb = mongoose.model('couponDetails', couponSchema);


module.exports = couponDb;