const walletDb = require('../models/wallet');

exports.myWallet = async (req,res) =>
{
    let walletPrice = 0;
    const user = req.session.normalUser;

    const walletData = await walletDb.find();

    for(let i=0; i<walletData.length;i++)
        {
            walletPrice += walletData[i].walletPrice;
        }
    res.render('user/wallet', {walletPrice});
    
}