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

const userOrderSchema = new mongoose.Schema({
  bookName: { type: String, required: true },
  quantity: { type: Number, required: true },
 
  price: { type: Number, required: true },
//   offerprice: { type: Number, required: true },
  offer :{ type: Number, default: 0},
  bookId : { type: String, required: true },
  orderStatus: { type: Number, default: 0},
});


const userOrderDb = mongoose.model('userOrders', userOrderSchema );


module.exports = userOrderDb;