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

const stockSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
        trim: true
    },
    bookName: {
        type: String,
        required: true,
        trim: true
    },
    
    stock: {
        type: String,
        required: true,
        trim: true
    },
});


const stockDb = mongoose.model('stockDetails', stockSchema);


module.exports = { stockDb };