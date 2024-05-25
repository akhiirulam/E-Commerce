const authUser = require('../models/authUser');
const {addressDb} = require('../models/addressDb');
const primaryAddressDb = require('../models/primaryAddress');
const mongoose = require('mongoose');

//DISPLAY ADDRESS
exports.address =  async (req,res) =>
{
  try {
    let user = req.session.normaluser;
    if (!user) {
      res.render('user/login', { wrongEmail: 'Please Login' });
    } else {
    const result = await authUser.findOne({ email: user });

    if (result) {
      res.render('user/address', { user, userDetails: result});
    } else {
      res.render('user/addressNotFound'); 
    }
  } 
}
catch (error) {
    console.error('Error in fetching user addresses:', error);
    res.render('error'); 
  }
  
}

//ADD ADDRESS
exports.addaddress = async (req,res) =>
{
  let user = req.session.normaluser;
try {
  if (!user) {
    res.render('user/login', { wrongEmail: 'Please Login' });
  } else {
  const result = await authUser.find({ email: user });
  const userAddress = result.addresses;
  if (result) {
    res.render('user/addaddress', { user, userDetails: result, addressDetails:userAddress });
  } else {
    
    res.render('error'); 
  }
} 
}catch (error) {
  console.error('Error in fetching address data:', error);
  res.render('error'); 
}

}

//SUBMIT ADDRESS
exports.submitAddress = async (req, res) => {
  try {
    console.log("I am here")
    const user = req.session.normaluser;
    if (!user) {
      res.render('user/login', { wrongEmail: 'Please Login' });
    } else {
      let { pincode, locality, address, district, state, landmark, alternatephone } = req.body;
      let addresstype = req.body.addresstype;

      // Trim the input fields
      pincode = pincode.trim();
      locality = locality.trim();
      address = address.trim();
      district = district.trim();
      state = state.trim();
      landmark = landmark.trim();
      alternatephone = alternatephone.trim();
      addresstype = addresstype.trim(); // Assuming addresstype should be trimmed as well
        
      // Create an object representing the new address
      const newAddress = {
        pincode,
        locality,
        address,
        district,
        state,
        landmark,
        alternatephone,
        addresstype,
      };

      // Find the user by email and update the addresses array
      const result = await authUser.findOneAndUpdate(
        { email: user },
        { $push: { addresses: newAddress } },
        { new: true } // To return the updated document
      );

      if (result) {
        res.redirect('/address');
      } else {
        // Handle the case when the update fails
        res.status(400).json({ success: false, message: 'Address update failed.' });
      }
    }
  } catch (error) {
    console.error('Error in updating address data:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.addressEdit = async (req, res) => {
    const user = req.session.normaluser;
    const addressId = req.params._id;
  
    try {
      const addressDetails = await authUser.findOne({ email: user });

      const addressToEdit = addressDetails.addresses.find(
        (address) => address._id.equals(addressId)
      );
      
      console.log("addressToEdit:", addressToEdit);
      if (addressToEdit) {
        res.render('user/addressEdit', { user, addressDetails: addressToEdit });
      } else {
        console.error('Address not found for editing');
        res.render('error');
      }
    } catch (error) {
      console.error('Error in fetching address details:', error);
      res.render('error');
    }
  };
  
exports.updateAddress = async (req, res) => {
    try {
      const user = req.session.normaluser;
      if (!user) {
        res.render('user/login', { wrongEmail: 'Please Login' });
      } else {
      const addressId = req.params._id;
      let { email, name, mobileNumber, pincode, locality, address, district, state, landmark, alternatephone } = req.body;
      let addresstype = req.body.addresstype;
  
      // Validate and sanitize inputs (consider using a validation library)
      
      pincode = pincode.trim();
      locality = locality.trim();
      address = address.trim();
      district = district.trim();
      state = state.trim();
      landmark = landmark.trim();
      alternatephone = alternatephone.trim();
      addresstype = addresstype;
  
      const dataInsert = {
        
        pincode,
        locality,
        address,
        district,
        state,
        landmark,
        alternatephone,
        addresstype,
      };

      const result = await authUser.findOneAndUpdate(
        { 'addresses._id': addressId },
        { $set: { 'addresses.$': dataInsert } },
        { new: true } // To return the updated document
      );
  
      if (result) {
        res.redirect('/address');
      } else {
        // Handle the case where the update was not successful
        res.status(500).send('Update failed');
      }
    }
   } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };

exports.primaryAddress = async (req, res) => {
  const user = req.session.normaluser;
  const addressId = req.params._id;
  
  try {
    const addressDetails = await authUser.findOne({ email: user });
    const deletePrimary = await primaryAddressDb.deleteMany({});
    const addressToInsert = addressDetails.addresses.find(
      (address) => address._id.equals(addressId)
    );
      
      const name =addressDetails.name;
      const email=addressDetails.email;
      const mobileNumber=addressDetails.mobileNumber;
      const pincode = addressToInsert.pincode;
      const locality =addressToInsert.locality;
      const address = addressToInsert.address;
      const district = addressToInsert.district;
      const state = addressToInsert.state;
      const landmark = addressToInsert.landmark;
      const alternatephone = addressToInsert.alternatephone;
      const addresstype = addressToInsert.addresstype;
      const primaryAddress = true;

      //console.log("addressToEdit:", name,email, phoneNumber, pincode, locality, address, district, state, landmark, alternatephone, addresstype );

      const dataInsert = {
        user,
        name,
        email,
        mobileNumber,
        pincode,
        locality,
        address,
        district,
        state,
        landmark,
        alternatephone,
        addresstype,
        primaryAddress
      };
      const userData = await authUser.findOne({ email: user });
      const result = await primaryAddressDb.insertMany([dataInsert]);
      if(result)
      {
        res.redirect(`/shippingAddress/${userData._id}`);
      }
    } catch (error) {
      console.error('Error in fetching address details:', error);
      res.render('error');
    }
  };

//DELETE ADDRESS

exports.addressDelete = async (req, res) => {
  try {
    const user = req.session.normaluser;
    if (!user) {
      res.render('user/login', { wrongEmail: 'Please Login' });
    } else {
      const addressId = req.params._id;
      
      if (!addressId){
        return res.status(400).send('Invalid addressId');
      }
      const addressDetails = await authUser.findOne({ email: user });

      const addressToEdit = addressDetails.addresses.find(
        (address) => address._id.equals(addressId)
      );

      const result = await authUser.findOneAndUpdate(
        { 'addresses._id': addressId },
        { $pull: { addresses: { _id: addressId } } },
        { new: true }
      );

      if (result) {
        // Address deleted successfully
        res.redirect('/address');
      } else {
        // No address found with the given _id
        res.status(404).send('Address not found');
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};
