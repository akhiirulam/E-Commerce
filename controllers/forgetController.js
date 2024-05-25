
const randomString = require ("randomstring");
const authUser = require('../models/authUser');
const nodemailer = require('nodemailer');


//FORGOT PASSWORD
exports.forget =  async (req,res) =>
{
  try {
    res.render('user/forget');
  } catch (error) {
    console.log(err.message);
  }
  
}

exports.forgetVerify = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await authUser.findOne({ email: email });

    if (userData) {
      if (!userData.userstatus) {
        res.render('user/forget', { wrongEmail: " Please verify your mail" });
      } else {
        const generatedString = randomString.generate(); // Use the appropriate method from your library
        const updateData = await authUser.updateOne({ email: email }, { $set: { token: generatedString } });

        sendResetPasswordMail(userData.name, userData.email, generatedString);
        res.render('user/forget', { wrongEmail: " Please check your email to reset your password" });
      }
    } else {
      res.render('user/forget', { wrongEmail: " Entered mail is incorrect" });
    }
  } catch (error) {
    console.error(error.message);
  }
}

//MAIL FOR RESET PASSWORD
const sendResetPasswordMail = async(name, email, token) =>
{
  try
  {
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
  const mailOptions = {
    to: email,
    subject: "For Reset Password: ",
    html: `<h3>Hello` +name+  ` please click here to </h3> <a href = http://127.0.0.1:3000/forget-password?token=` + token +`> Reset </a> your password`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error while sending OTP:', error);
      res.status(500).json({ error: 'Failed to send OTP' });
    } else {
     
      res.render('user/otp', { Message: 'Please enter OTP within 1 minutes',otpValue: otp });
    }
  })
      }
      catch (error) {
        console.error('Error while inserting data:', error);
        res.status(500).json({ error: 'Failed to insert data' });
      }
}

exports.forgetPasswordLoad = async(req,res) =>
{
  try {
    const token = req.query.token;
    const tokenData = await authUser.findOne({token:token});
    if(tokenData)
    {
      res.render('user/forget-password',{user_id:tokenData._id});
    }
    else
    {
      res.render('404',{message:'Token is invalid'});
    }
  } catch (error) {
    console.log(error.message);
  }
}

exports.resetPassword = async (req,res) =>
{
  try {
    const password = req.body.password;
    const user_id = req.body.user_id;

    const updatedData= await authUser.findByIdAndUpdate({_id:user_id},{$set:{password:password, token:''}});
    if(updatedData)
    {
      res.render('user/login', {wrongMessage:"Your password is reset"});
    }
  } catch (error) {
    console.log(error.message);
  }

}
