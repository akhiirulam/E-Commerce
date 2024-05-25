const Razorpay = require('razorpay');
const userOrderDb = require('../models/userOrderDb');
const authUser = require('../models/authUser');
const primaryAddressDb = require('../models/primaryAddress');
const Order = require('../models/orderDb');
const cartDb = require('../models/cartDb');

const razorpay = new Razorpay({
  key_id: 'rzp_test_xaDOu7o15bgz2M',
  key_secret: 'dxySgMom4MeL7ptCd46WlWVD',
});

exports.razorPayment = async (req, res) => {
  const userOrder = await userOrderDb.find({});

  if (userOrder.length == 0) {
    res.render('user/payment', { Message: "Please add items to your cart" });
  } else {
    let totalPrice = 0;
    for (let i = 0; i < userOrder.length; i++) {
      const price = userOrder[i].price;
      const quantity = userOrder[i].quantity;
      totalPrice += price * quantity;
    }

    var options = {
      amount: totalPrice*100,  // amount in the smallest currency unit
      currency: "INR",
      receipt: "rcptid1"
    };

    try {
      const response = await razorpay.orders.create(options);
      console.log("Razorpay order created successfully:", response);
      const orderId = response.id;
      const amount = response.amount;
      const currency = response.currency;
      const prefill = {
        name: 'Shippy',
        email: 'shippy@gmail.com'
      };
     
      // Redirect user to Razorpay payment page
      res.render('user/checkout', { orderId, razorpay, amount, currency, prefill });
    } catch (err) {
      console.error("Error creating Razorpay order:", err);
      res.render('user/payment', { Message: "Error: Unable to create order. Please try again!" });
    }
  }
}
exports.razorpayConfirm = async (req,res)=> {
  try {
    let user = req.session.normaluser;

    // Check if the order has already been processed
    if (req.session.orderProcessed) {
      // Redirect to myOrder page if the order has already been processed
      return res.redirect('/myOrder');
    }
    else
    {
    const userOrder = await userOrderDb.find({});
    const userDetails = await authUser.findOne({ email: user });
    const addressData = await primaryAddressDb.findOne({});
    const status = 'Pending';
   

    if (!userDetails || !addressData) {
      return res.status(400).json({ success: false, message: 'User details or address not found' });
    }

    const dataToInsert = {
      user,
      userId:userDetails._id,
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

    const result = await Order.insertMany(dataToInsert);
    const deleteCart = await cartDb.deleteMany({});

    req.session.orderProcessed = true;


    const cartData = await userOrderDb.find({});
    const updatedAddressData = await primaryAddressDb.find({});
    const deleteOrder = await userOrderDb.deleteMany({});
    console.log(cartData);
    res.render('user/ordersummary', { user, cartData, addressData: updatedAddressData, message: 'Order Successful' });

  
  }
  } catch (error) {
    console.error('Error in codPaymentInit:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}


