const mongoose = require('mongoose');

const { User, Product } = require('../models/dbconnection');
const authUser = require('../models/authUser');
const { addressDb } = require('../models/addressDb');
const Order = require('../models/orderDb');
const cartDb = require('../models/cartDb');
const userOrderDb = require('../models/userOrderDb');
const primaryAddressDb = require('../models/primaryAddress');
const couponDb = require('../models/couponDb');

require('dotenv').config();

const nodemailer = require('nodemailer');
const { render } = require('ejs');


//Home
exports.home = async (req, res) => {
  try {
    let user = req.session.normaluser;
    const userStatus = await authUser.findOne({ email: user });
    const productData = await Product.find({});

    if (!userStatus || !userStatus.userstatus) {
      res.render('user/login', { userBlocked: 'User is blocked' });
    } else {
      if (req.session.loggedIn) {
        // Set cache control headers to prevent caching
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        const newproductData = await Product.find({});
        const totalCount = newproductData.length;
        let latestDate = newproductData[0].publishedDate;
        let latestProduct;

        const dateArray = [];
        for (let i = 0; i < totalCount; i++) {
          dateArray.push(newproductData[i].publishedDate);
        }
        const dates = dateArray.map(dateString => new Date(dateString));
        latestDate = new Date(Math.max(...dates));

        for (let i = 0; i < totalCount; i++) {
          if (new Date(newproductData[i].publishedDate).getTime() === latestDate.getTime()) {
            latestProduct = newproductData[i];
            break; // Stop looping once the latest product is found
          }
        }

        res.render('home', { user, productData: latestProduct, latestDate });
      } else {
        res.render('user/login', { wrongEmail: 'Please sign in' });
      }
    }
  } catch (error) {
    // Handle any unexpected errors
    console.error('Unexpected error in the home route:', error);
    res.status(500).send('Internal Server Error');
  }
};

// User Signup
function generateOTP() {
  // Replace this with your actual OTP generation logic
  return Math.floor(1000 + Math.random() * 9000).toString();
}

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  service: 'Gmail',

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }

});

// Generate OTP
const gotp = generateOTP();
const otp = gotp;

//user signup
exports.signup = async (req, res) => {
  let { name, email, password, confirmPassword, mobileNumber } = req.body;
  name = name.trim();
  email = email.trim();
  password = password.trim();
  confirmPassword = confirmPassword.trim();
  mobileNumber = mobileNumber.trim();

  const existUser = await authUser.findOne({ email: req.body.email });
  const existMobile = await authUser.findOne({ mobileNumber: req.body.mobileNumber });
  if (existUser) {
    res.render('user/signup', { validMessage: 'Email already exists. Please choose a different Email' });
  }
  else if (existMobile) {
    res.render('user/signup', { mobileMessage: 'Mobile number already exists. Please choose a different Mobile number' });
  }
  else {
    let userEmail = req.body.email;
    try {
      // Data to be inserted
      const dataToInsert = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        mobileNumber: req.body.mobileNumber,
        auth: 0,
        otp,
        userstatus: true,
        otpchance: 2
      };


      // Insert the data into the database
      const result = await User.insertMany(dataToInsert);

      // Send OTP
      const mailOptions = {
        to: userEmail,
        subject: "Otp for registration is: ",
        html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>"
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error while sending OTP:', error);
          res.status(500).json({ error: 'Failed to send OTP' });
        } else {

          res.render('user/otp', { Message: 'Please enter OTP within 1 minutes', otpValue: otp });
        }
      })
    }
    catch (error) {
      console.error('Error while inserting data:', error);
      res.status(500).json({ error: 'Failed to insert data' });
    }
  }

};

//OTP Verification
exports.verify = async (req, res) => {
  if (req.body.otp == otp) {
    const data = await User.findOne({ otp: req.body.otp });

    const dataToInsert = {
      name: data.name,
      email: data.email,
      password: data.password,
      mobileNumber: data.mobileNumber,
      userstatus: true,
      addressess: [],

    };
    // Insert the data into the database
    const result = await authUser.insertMany(dataToInsert);

    if (result) {
      console.log('successfull')
      res.render('user/login', { wrongEmail: 'Signup is Successful, Please Login' });
    }
  }
  else {
    res.render('user/otp', { otpMessage: 'OTP is incorrect' });
  }
};

//getverify
exports.getverify = async (req, res) => {
  try {
    const sdelete = await User.deleteOne({ $and: [{ otp: gotp }, { auth: 0 }] });
    console.log(sdelete);

    if (sdelete.deletedCount > 0) {
      res.redirect('/signup');
    } else {
      throw new Error('No documents matched the deletion criteria');
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

//OTP resend
exports.resend = async function (req, res) {
  try {
    const user = await User.findOne({ otp: gotp });

    if (!user) {
      throw new Error('User not found with the given OTP');
    }

    const userEmail = user.email;

    const result = await User.updateOne(
      { otp: gotp, otpchance: { $gt: 0 } },
      { $inc: { otpchance: -1 } }
    );

    if (user.otpchance > 0) {
      user.otpchance--;
      await user.save();

      var mailOptions = {
        to: userEmail,
        subject: "Otp for registration is: ",
        html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>"
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          throw new Error('Error while sending OTP: ' + error.message);
        }

        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        res.render('user/otp', { msg: "otp has been sent" });
      });
    } else {
      res.render('user/signup', { chanceMessage: "OTP limit exhausted, Please try after 2 minutes" });
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.render('user/signup', { chanceMessage: "Times Up, Please Sign Up again" });
  }
};

exports.myOrder = async (req, res) => {
  try {
    const user = req.session.normaluser;
    const userDetails = await authUser.find({ email: user });
    const Id = userDetails[0]._id;

    const productData = await Order.find({ userId: Id });
    if (productData) {
      res.render('user/myOrder', { user,productData });
    }

  } catch (error) {
    console.log(error.message);
  }

}

//SHOP
exports.shippingAddress = async (req, res) => {
  try {
    let user = req.session.normaluser;
    let offerPrice = 0;
    const coupon = req.body.coupon;
    const id = req.params._id;
    let couponValue, couponValidity = 0;
    let productToUpdate;
    const userOrderDetails = [];

    const couponData = await couponDb.find({});
    const userDetails = await authUser.findOne({ email: user });
    const primaryAddress = await primaryAddressDb.find({ email: user });
    const userCart = await cartDb.findOne({ email: user }).populate('products.product');

    const itemCount = userCart ? userCart.products.length : 0;
    if (!userCart || !userCart.products || userCart.products.length === 0) {
      // Redirect to the "bookview" page or any other desired page
      return res.redirect('/bookview'); // Adjust the URL as needed
    }

    for (let i = 0; i < couponData.length; i++) {
      if (couponData[i].couponCode === coupon) {
        couponValue = couponData[i].couponPercentage;

        const timestamp = couponData[i].couponValidity;
        console.log(couponValue); // Log timestamp for troubleshooting
        couponValidity = new Date(timestamp);
        break;
      }
    }

    const currentDate = new Date();

    if (currentDate <= couponValidity) {
      
      for (let i = 0; i < userCart.products.length; i++) {

        if (userCart.products[i]._id == id) {
          offerPrice = (userCart.products[i].price) * (couponValue / 100);

          const productIndex = userCart.products.findIndex(product => product._id.equals(id));

          if (productIndex !== -1) {
           
            productToUpdate = userCart.products[productIndex];

            productToUpdate.offerTag = coupon;

            if(productToUpdate.priceUpdate==0)
            {
              productToUpdate.price = offerPrice;
            }
            
            productToUpdate.priceUpdate = 1;
            await userCart.save();

            res.render('user/shippingAddress', { user, userCart, userDetails, primaryAddress, itemCount });
            break;
          }
        }
      }
      if (isNaN(offerPrice)) {

        return res.render('user/shippingAddress', { Message: "Coupon is invalid or coupon expired", user, userCart, userDetails, primaryAddress, itemCount });
      }
    } else {
      //  console.log("hello");
    }

    const deleteOrderCart = await userOrderDb.deleteMany({});

    console.log(offerPrice)

    for (let i = 0; i < userCart.products.length; i++) {
      userOrderDetails.push(userCart.products[i]);
    }

    for (let i = 0; i < userCart.products.length; i++) {
      const bookName = userOrderDetails[i].product.bookName;
      //const price = userOrderDetails[i].price;
      const price = offerPrice;
      const offer = couponValue;
      const quantity = userOrderDetails[i].quantity;
      const bookId = userOrderDetails[i].product._id;
      const Orderstatus = 0;
      const dataToInsert = { bookName, price, offer, quantity, bookId, Orderstatus };

      const result = await userOrderDb.insertMany([dataToInsert]);
      if (result) {
        req.session.orderInsert = true;
      }
    }

    return res.render('user/shippingAddress', { user, userCart, userDetails, primaryAddress, itemCount});

  } catch (error) {
    console.error('Error in fetching user data:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}


exports.codPayment = async (req, res) => {

  // console.log("Hello");
  // res.render("user/cod");
  const user = req.session.normaluser;
  const addressId = req.query.addressId;
  const userCartId = req.query.userCartId;
  req.session.orderProcessed = false;
  try {
    if (!user) {
      res.render('user/login', { wrongEmail: 'Please Login' });
    } else {
      const userData = await authUser.findOne({ email: user });
      const addressData = await primaryAddressDb.findOne({});
      if (!addressData) {

        res.render('error');
        return;
      }
      else {
        const cartData = await cartDb.findOne({ _id: userCartId }).populate('products.product');
        res.render("user/payment", { user, userData, cartData, addressData });
      }

    }
  } catch (error) {
    console.error('Error in fetching COD data:', error);
    res.render('error');
  }

}

exports.codPaymentInit = async (req, res) => {
  try {
    let user = req.session.normaluser;
    const cartData = await cartDb.find({}).populate('products.product');
  
      const userOrder = await userOrderDb.find({});
      const userDetails = await authUser.findOne({ email: user });
      const addressData = await primaryAddressDb.findOne({});
     
      console.log(cartData);

      if (!Array.isArray(cartData) || cartData.length === 0) {
        // Handle the case when cartData is not an array or is empty
        return res.redirect('/home');
    }
      
      if (!userDetails || !addressData) {
        return res.status(400).json({ success: false, message: 'User details or address not found' });
      }
     
      const dataToInsert = {
        user,
        userId: userDetails._id,
        email: userDetails.email,
        name: addressData.name,
        mobileNumber: addressData.mobileNumber,
        pincode: addressData.pincode,
        locality: addressData.locality,
        address: addressData.address,
        district: addressData.district,
        state: addressData.state,
        landmark: addressData.landmark,
        alternatephone: addressData.alternatephone,
        addresstype: addressData.addresstype,
        orderStatus: 1,
        orders: userOrder,
      };

      // Check if the order has already been processed
      
        const result = await Order.insertMany(dataToInsert);
           
       // Set orderProcessed flag to true and save session
        req.session.orderProcessed = true;
        await req.session.save();

        // Render the order summary page
        // return res.render('user/ordersummary', { user, cartData, addressData: updatedAddressData, message: 'Order Successful' });
        return res.redirect('/ordersummary');

  } catch (error) {
    console.error('Error in codPaymentInit:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};


exports.ordersummary = async (req, res, next) => {
  let user = req.session.normaluser;

  try {
    if (!user) {
      res.render('user/login', { wrongEmail: 'Please Login' });
    } else {
    
      const cartData = await cartDb.find({}).populate('products.product');
      const primaryAddress = await primaryAddressDb.find({ email: user });
    

      const deleteCart = await cartDb.deleteMany({});
      const deleteOrder = await userOrderDb.deleteMany({});

      console.log(deleteCart);

      if (!cartData || !primaryAddress) {
        // Handle the case when any of the required data is not found
        res.status(400).json({ success: false, message: 'Invalid request or data not found.' });
        return;
      }

      res.render('user/ordersummary', { user, cartData, addressData:primaryAddress,message: 'Order Successful' });
    }
  } catch (error) {
    console.error('Error in showOrderSummary:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
  next();
};

//LOGOUT
exports.logout = (req, res) => {
  // Logout logic here
  delete req.session.loggedIn;
  res.redirect('/login'); // Redirect to the admin login page
};


