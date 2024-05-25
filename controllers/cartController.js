const mongoose = require('mongoose');

const {Product} = require('../models/dbconnection');
const authUser = require('../models/authUser');
const cartDb = require('../models/cartDb');
const Order = require('../models/orderDb');
const userWishList = require('../models/wishListDb');
const couponDb = require('../models/couponDb');
const userOrderDb = require('../models/userOrderDb');
const walletDb = require('../models/wallet');

const ITEMS_PER_PAGE = 5; // Number of items to display per page

  const getPaginationInfo = (totalItems, currentPage) => {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return {
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
  };
};

//ADD TO CART
exports.addtocart = async (req, res) => {
  const productId = req.params._id;
  const quantity = parseInt(req.body.quantityInput);
  const user = req.session.normaluser;
  const offerTag = '';
  
  try {
    if (!user) {
      res.render('user/login', { wrongEmail: 'Please Login' });
    } else {
      // Fetch product data
      const productData = await Product.findOne({ _id: productId });

      const quantityReduce = await Product.updateOne({_id:productId}, {$inc:{stock:-quantity}})
      // Fetch user's cart data
      let userCart = await cartDb.findOne({ email: user });


      // If the user doesn't have a cart, create a new one
      if (!userCart) {
        userCart = new cartDb({
          email: user,
          products: [
            
          ],
          addressId: false
        });
      }

      const userCartId = userCart._id;

      // Check if the product is already in the cart
      const existingProduct = userCart.products.find(product => product.product.equals(productId));

      if (existingProduct) {
        // If the product is already in the cart, update the quantity
        existingProduct.quantity += (quantity || 1);
      } else {
        // If the product is not in the cart, add it
        userCart.products.push({
          product: productId,
          quantity: quantity || 1,
          // offerprice: 1,
          price: productData.price,
          
        });
      }

      // Save the updated cart
      await userCart.save();

      // Respond with a success status
      if(!quantity)
      {
        const quantity = 1;
        res.redirect(`/cart?quantity=${quantity}`);
      }
      else
      {
        res.redirect(`/cart?quantity=${quantity}`);
      }
      
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

exports.addWishlist = async (req, res) => {
  try {
    const user = req.session.normaluser;
    const productId = req.params._id;

    const bookId = productId;
    const email = user;
    const dataToInsert = { bookId, email };

    const currentPage = parseInt(req.query.page) || 1;
    const totalBooks = await Product.countDocuments();
    const skip = (currentPage - 1) * ITEMS_PER_PAGE;
    const bookViews = await Product.find().populate('genres').skip(skip).limit(ITEMS_PER_PAGE);
    const paginationInfo = getPaginationInfo(totalBooks, currentPage);
    // Insert data into the userWishList collection
    const result = await userWishList.insertMany([dataToInsert]);

    res.render('user/bookview', { user, bookViews, paginationInfo, WishMessage: 'Product added to wishlist successfully'  });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to add product to wishlist' });
  }
};


exports.myWishlist = async (req, res) => {
  try {
    const user = req.session.normaluser;
    const productData = await userWishList.find({ email: user });

    const bookViews = [];
    for (let i = 0; i < productData.length; i++) {
      const productId = productData[i].bookId;
      const product = await Product.findById(productId).populate('genres');
      if (product) {
        bookViews.push(product);
      }
    }
    const currentPage = parseInt(req.query.page) || 1;
    const skip = (currentPage - 1) * ITEMS_PER_PAGE;
    const totalBooks = bookViews.length;
    const paginatedBookViews = bookViews.slice(skip, skip + ITEMS_PER_PAGE);
    const paginationInfo = getPaginationInfo(totalBooks, currentPage);

    res.render('user/wishList', { user, bookViews: paginatedBookViews, paginationInfo });
  
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

exports.removeWishItem = async (req,res) =>
{
  const user = req.session.normaluser;
  const productId = req.params._id;
  const result = await userWishList.deleteOne({ bookId: productId});

  if(result)
  {
    res.redirect('/myWishlist')
  } else {
    // No item found with the given productId
    res.status(404).send('Item not removed');
  }
}

//CART
exports.cart = async (req, res) => {
  const user = req.session.normaluser;
  const quantity = req.query.quantity
  const coupon = req.query.coupon;
  
try {
  if (!user) {
    res.render('user/login', { wrongEmail: 'Please Login' });
  } else {
  // Retrieve the user's cart from the database
  const userCart = await cartDb.findOne({ email: user }).populate('products.product');
  const userData = await authUser.findOne({ email: user });
  const itemCount = userCart ? userCart.products.length : 0;
  const couponData = await couponDb.findOne({couponCode:coupon});
  // Check if isDeleted is false before rendering the cart
  if (userCart && !userCart.isDeleted) {
    // Render the cart page with cart data
    if(coupon!=0)
    {
      res.render('user/cart', { user, userCart, userData, itemCount, quantity, couponData });
    }
    else
    {
      let coupon = 0;
      res.render('user/cart', { user, userCart, userData, itemCount, quantity,coupon });
    }
   
  } else {
    // Optionally, you can redirect to a different page or render an error message
    res.redirect('/bookview');
  }
}
} catch (error) {
  console.error(error);
  res.status(500).send('Internal Server Error');
}
};

//REMOVE ITEM FROM CART
exports.removeItem = async (req, res) => {
  try {
    const user = req.session.normaluser;
 
    if (!user) {
      res.render('user/login', { wrongEmail: 'Please Login' });
    } else {
    const productId = req.params._id;
 
    const productData = await cartDb.findOne({'products.product':productId});

    const quantity = productData.products[0].quantity;
    
    
    const quantityIncrease = await Product.updateOne({_id:productId}, {$inc:{stock:quantity}})
    console.log(quantityIncrease);
    // Validate if productId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).send('Invalid productId');
    }

    const result = await cartDb.updateOne(
      { 'products.product': productId },
      { $pull: { products: { product: productId } } }
    );
    const deleteOrder = await userOrderDb.deleteMany({});
    const userData =  await authUser.findOne({email:user});

    if (result) {
      // Item deleted successfully
      res.redirect(`/cart`);
    } else {
      // No item found with the given productId
      res.status(404).send('Item not removed');
    }
  }
 } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

exports.cancelItem = async (req, res) => {
  const user = req.session.normaluser;
  const Id = req.params._id;

  const userDetails = await authUser.findOne({email:user});
  

  const orderBook = await Order.findOne({"orders._id":Id},{"orders.$": 1});
  const bookId = orderBook.orders[0].bookId;
  const quantity = orderBook.orders[0].quantity;
  const bookPrice = orderBook.orders[0].price;
  const currentDate = new Date();
  const productData = await Order.find({email:user});

  const updateData = await Order.updateOne(
    { "orders._id": Id }, 
    { $set: { "orders.$[order].orderStatus": 1 } }, 
    { arrayFilters: [{ "order._id": Id }] } 
  );

  const quantityUpdate = await Product.updateOne({ _id: bookId }, {$inc:{stock:quantity}} )

  const walletData = {
    userId: userDetails._id,
    walletPrice: bookPrice,
    date: currentDate
};

const insertResult = await walletDb.insertMany(walletData);
  res.redirect('/myOrder');

  
};

exports.returnItem = async(req,res) => {
  const user = req.session.normaluser;
  const orderId = req.params._id;
  
  const result = await Order.find({"orders._id":orderId});
  
  const userDetails =  await authUser.find({email:user});
  const Id = userDetails[0]._id;
  const updateData = await Order.updateOne({"orders._id":orderId},{$set:{"orders.$.orderStatus":3}})
  const productData = await Order.find({userId:Id});
  
  for(let i=0; i<result[0].orders.length; i++)
  {
    const bookIdToUpdate = result[0].orders[i].bookId;
    const quantityToUpdate = result[0].orders[i].quantity;

    const quantityUpdate = await Product.updateOne({_id:bookIdToUpdate},{$inc:{stock:quantityToUpdate}})
    if(quantityUpdate)
    {
      console.log("Successful");
    }
  }

  if(productData)
  {
    res.render('user/myOrder',{productData});
  }
}