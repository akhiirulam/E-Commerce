const couponDb = require('../models/couponDb');
const authUser = require('../models/authUser');
const cartDb = require('../models/cartDb');
const primaryAddressDb = require('../models/primaryAddress');
const userOrderDb = require('../models/userOrderDb');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));


exports.removeCoupon = async (req, res) => {
    let offerPrice = 0;
   
    const id = req.params._id;
    console.log(id);
    const userOrderDetails = [];

    const user = req.session.normaluser;
   
    const userDetails = await authUser.findOne({ email: user });
  
    const userCart = await cartDb.findOne({ email: user }).populate('products.product');
    const primaryAddress = await primaryAddressDb.find({ email: user });
    
    for (let i = 0; i < userCart.products.length; i++) {

        if (userCart.products[i]._id == id) {
        

          const productIndex = userCart.products.findIndex(product => product._id.equals(id));

          const productDetails = userCart.products[productIndex];
          const offerTag = productDetails.offerTag;
          const itemCount= productDetails.quantity;
          console.log(offerTag);
          const couponOffer = await couponDb.findOne({ couponCode: offerTag });

            console.log(couponOffer.couponPercentage);

          offerPrice = (userCart.products[i].price *  100)/ couponOffer.couponPercentage;

          if (productIndex !== -1) {
           
            const productToUpdate = userCart.products[productIndex];

            productToUpdate.price = offerPrice;
            productToUpdate.priceUpdate = 0;
            await userCart.save();

            res.render('user/shippingAddress', { user, userCart, userDetails, primaryAddress, itemCount });
            break;
          }
        }
    }
    const deleteOrderCart = await userOrderDb.deleteMany({});
    for (let i = 0; i < userCart.products.length; i++) {
        userOrderDetails.push(userCart.products[i]);
      }
  
      for (let i = 0; i < userCart.products.length; i++) {
        const bookName = userOrderDetails[i].product.bookName;
        const price = userOrderDetails[i].price;
        const quantity = userOrderDetails[i].quantity;
        const bookId = userOrderDetails[i].product._id;
        const Orderstatus = 0;
        const dataToInsert = { bookName, price, quantity, bookId, Orderstatus };
  
        const result = await userOrderDb.insertMany([dataToInsert]);
      }
}

