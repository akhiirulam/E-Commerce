const authUser = require('../models/authUser');
const bcrypt = require('bcrypt');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { render } = require('ejs');
// const { use } = require('../routes/userRoutes');

//user side login

//admin side login
exports.adminlogin = async (req,res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  const adminemail = "admin@gmail.com";
  const adminpassword = "123";
  const email = req.body.email;
  const password = req.body.password;
  
    try{
      if (email === adminemail && password === adminpassword) {

        req.session.adminloggedIn = true;
        req.session.user = email;
        req.session.save((err) => {
            if (err) {
              console.error('Error saving session:', err);
            }
            res.redirect('/adminDashboard');
          });
      } else {
        res.render('adminlogin', { wrongEmail:"Please check your Email",wrongPassword:"Please check your Password"});
      }
    } catch (error) {
      console.error('Login Error:', error);
      res.status(500).send('Internal Server Error');
    }
};

exports.adminDashboard = async (req, res) => {
   try {
     let user = req.session.user;
   
       res.render('admin/admindashboard', { user, Message:'Please signin' });
    
   } catch (error) {
    
     console.error('Error in adminDashboard route:', error);
     res.status(500).send('Internal Server Error');
   }

  };

//Users
exports.userlist = async (req,res) =>
{
  let user = req.session.user;
  try {

    const shoppyUsers = await authUser.find();
    res.render('admin/userlist', { user,userData: shoppyUsers });
 
}
  catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Internal Server Error');
    }
  
};
//USER MANAGEMENT

exports.blockuser = async(req,res) =>
{
  try {
 
    const userid = req.params._id;
    const userblock = await authUser.updateOne({ _id: userid }, { $set: { userstatus: false } });

    if (userblock) {
      res.redirect('/userslist');
    }
 
  } catch (error) {

    console.error('An error occurred:', error);
    res.status(500).send('Internal Server Error');
  }
};

exports.unblockuser = async(req,res) =>
{
  try {
  const userid = req.params._id;
  const userblock = await authUser.updateOne({ _id: userid }, { $set: { userstatus: true } });

  if (userblock) {
    res.redirect('/userslist');
  }
  } catch (error) {
 
    console.error('An error occurred:', error);
    res.status(500).send('Internal Server Error');
  }

}
// admin side ==> product
  
exports.adminlogout = async(req,res)=>
{
  try {
  delete req.session.adminloggedIn;
  res.redirect('/adminlogin');
  } catch (error) {
  
    console.error('An error occurred:', error);
    res.status(500).send('Internal Server Error');
  }
};