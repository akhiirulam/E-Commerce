const mongoose = require("mongoose");

// Use environment variables for configuration
const MONGODB_URL = process.env.MONGODB_URL || "mongodb://0.0.0.0:27017/shoppyuser";

// Connect to MongoDB
mongoose.connect(MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });

// Handle connection events
const db = mongoose.connection;

const { Schema, ObjectId } = mongoose;



// USER SCHEMA
const userOTPSchema = new mongoose.Schema({
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
  mobileNumber:
  {
    type: String,
    required: true,
    trim: true
  },
 auth:{
  type: Number,
  required: true,
  trim: true
  },
  otp:
  {
    type:Number,
    required:true
  },
  userstatus: {
    type: Boolean,
    required:true
  },
  otpchance:{
    type:Number,
    required:true
  }
  
},{timestamps:true});
userOTPSchema.index({ createdAt: 1 }, { expireAfterSeconds: 100 });


//PRODUCT SCHEMA

const productSchema = new mongoose.Schema({
  bookName: {
    type: String,
    required: true,
  },
  bookDetail: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  publisher: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  genres: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
  publishedDate: {
    type: Date,
    required: true,
  },
  images: [{
    data: Buffer,
    contentType:String,
    filename: String,
  }],
  // img0: { type: String },
  // img1: { type: String },
  // img2: { type: String },
});
productSchema.index({ bookName: 'text' });
///
const categorySchema = new mongoose.Schema({
  category:{
    type: String,
  },
})

// User model
const User = mongoose.model('User', userOTPSchema);
//product model
const Product = mongoose.model('Product',productSchema)
//category model
const Category = mongoose.model('Category',categorySchema);
module.exports = {User,Product,Category};
