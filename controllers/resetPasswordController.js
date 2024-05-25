const authUser = require('../models/authUser');

exports.resetPassword = (req,res) =>
{
    const user = req.session.normaluser;
    res.render('user/resetPassword',{user})
}

exports.newPassword = async (req,res) =>
{
    const user = req.session.normaluser;
    const userData = await authUser.findOne({email:user});
    const oldPassword = req.body.oldPassword;
    const newPassword  =req.body.newPassword ;
   
    if(oldPassword == userData.password)
    {
        const result = await authUser.updateOne({$set:{password:newPassword}});
        if(result)
        {
            res.render('user/resetPasswordSuccess',{user, message:"Your password successfully reset"});
        }
        else
        {
            res.render('user/resetPasswordSuccess',{user, message:"Your password not successfully reset"});
        }
    }
    else
    {
        res.render('user/resetPasswordSuccess',{user, message:"You entered wrong old password"});
    }

    
}