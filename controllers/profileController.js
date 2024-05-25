const authUser = require('../models/authUser');


//PROFILE
exports.profile = async(req,res)=>
{
try {
  let user = req.session.normaluser;
  if (!user) {
    res.render('user/login', { wrongEmail: 'Please Login' });
  } else {
  // Assuming 'authUser' is your user model
  const result = await authUser.findOne({ email: user });

  if (result) {
    // Render the profile page if the user is found
    res.render('user/profile', { user, userData: result });
  } else {
    // Handle the case where the user is not found
    res.render('user/profileNotFound'); // You can replace 'user/profileNotFound' with the appropriate page or handle it accordingly
  }
}
} catch (error) {
  console.error('Error in finding user profile:', error);
  res.render('error'); // You can replace 'error' with the appropriate error page or handle it accordingly
}
}

//PROFIL EDIT

exports.profileedit = async (req,res) => 
{
  let user = req.session.normaluser;
  const userId = req.params._id;

try {
  if (!user) {
    res.render('user/login', { wrongEmail: 'Please Login' });
  } else {
  const result = await authUser.findOne({ _id: userId });

  if (result) {
    
    res.render('user/profileedit', { user, userData: result });
  } else {
   
    res.render('user/profileNotFound'); 
  }
}
} catch (error) {
  console.error('Error in finding user profile for editing:', error);
  res.render('error'); 
}

}

//PROFILE UPDATE
exports.profileupdate = async (req,res) =>
{
  try {
    let user = req.session.normaluser;
    if (!user) {
      res.render('user/login', { wrongEmail: 'Please Login' });
    } else {
    const userId = req.params._id;
    let { name, email, mobileNumber } = req.body;
    name = name.trim();
    email = email.trim();
    mobileNumber = mobileNumber.trim();
    console.log(name, email, mobileNumber);
    
    const dataToInsert = {
      name, email, mobileNumber
    };
  

    const result = await authUser.updateOne({ _id: userId }, { $set: dataToInsert });
    const userDetails = await authUser.findOne({ _id: userId });
    if (result.nModified > 0) {
 
  
      res.render('user/profile', { user, userData: userDetails, Message: 'User is updated' });
    } else {
     
      res.render('user/profile',{user, userData: userDetails}); 
    }
  } 
}catch (error) {
    console.error('Error in updating user profile:', error);
    res.render('error');
  }
  
}

