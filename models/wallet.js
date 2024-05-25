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

const walletSchema = new mongoose.Schema({
    userId:{
        type: String, 
        required: true 
    },
    walletPrice: { 
        type: Number,
        required: true,
        trim: true,
        default:0
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const walletDb = mongoose.model('walletDetails', walletSchema);


module.exports =  walletDb ;