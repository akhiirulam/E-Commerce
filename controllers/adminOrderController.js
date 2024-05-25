const Order = require('../models/orderDb');
const {Product} = require('../models/dbconnection');



exports.orderList = async(req,res) =>
{
  try {
          
    const productData = await Order.find({});
  
    if(productData)
    {
      res.render('admin/orderList',{productData});
    }

} catch (error) {
  console.log(error.message);
}
}

exports.canceledOrder = async (req,res) =>
{
    try {
          
        const productData = await Order.find({});
        if(productData)
        {
          res.render('admin/canceledOrder',{productData});
        }
  
    } catch (error) {
      console.log(error.message);
    }
}

exports.placedOrder = async (req,res) =>
{
    try {
          
        const productData = await Order.find({});
        if(productData)
        {
          res.render('admin/placedOrder',{productData});
        }
  
    } catch (error) {
      console.log(error.message);
    }
}

exports.returenedOrder = async (req,res) =>
{
    try {
          
        const productData = await Order.find({});
        if(productData)
        {
          res.render('admin/returnedOrder',{productData});
        }
  
    } catch (error) {
      console.log(error.message);
    }
}

exports.deliveredItem = async(req,res) =>
{
  const orderId = req.params._id;
  console.log(orderId);
  try {
          
    const productData = await Order.find({});
    if(productData)
    {
      const updateData = await Order.updateOne({"orders._id":orderId},{$set:{"orders.$.orderStatus":2}})
      res.render('admin/orderList',{productData});
    }

  } catch (error) {
    console.log(error.message);
  }
}