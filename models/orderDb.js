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

const orderSchema = new mongoose.Schema({
    user: { type: String, required: true },
    email: { type: String, required: true },
    userId:{type: String, required: true },
    name: { type: String, required: true },
    mobileNumber: { type: Number, required: true },
    pincode: { type: Number, required: true },
    locality: { type: String, required: true },
    address: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    landmark: { type: String, required: true },
    alternatephone: { type: Number, required: true },
    addresstype: { type: String },
    orders: [
        {
            bookName: { type: String, required: true },
            quantity: { type: Number, required: true },
            // offerprice: { type: Number, required: true },
            price: { type: Number, required: true },
            offer :{ type: Number, default: 0},
            bookId : { type: String, required: true },
            orderStatus: { type: Number, default: 0},
        }
    ],
    status:{type: Boolean},
    date: { type: Date, default: Date.now }
});

const Order = mongoose.model('orderDetails', orderSchema);

module.exports = Order;  // Fix the typo here (change 'export' to 'exports')
