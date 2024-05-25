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

const cartSchema = new mongoose.Schema({
    products: [{
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        quantity: {
          type: Number,
          default: 1, // You can set a default quantity if needed
        },
        price: {
          type: Number,
          required: true,
          trim: true,
        },
        priceUpdate: {
          type: Number,
          default: 0,
        },
        offerTag: {
          type: String,
      
          trim: true,
          default: '',
        },
        order: {
          type: Number,
          default: 0, // You can set a default quantity if needed
        },
      }],
      email: {
        type: String,
        required: true,
        trim: true,
      },
      isDeleted: {
        type: Boolean,
        default: false, // You can set a default quantity if needed
      },
      
});


const cartDb = mongoose.model('cartDetails', cartSchema);


module.exports = cartDb;