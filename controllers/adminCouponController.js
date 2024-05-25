
const couponDb = require('../models/couponDb');


exports.couponList = async (req, res) => {
    try {
        const user = req.session.user;
        const couponData = await couponDb.find({});
        res.render('admin/couponList', { couponData: couponData, user: user });
    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};
exports.addCoupon = async (req, res) => {
    res.render('admin/couponAdd');
}

exports.couponCreate = async (req, res) => {
    const user = req.session.user;
    let { couponCode, couponPercentage, couponType, couponValidity } = req.body;

    // Trim the couponType and couponValidity
    couponPercentage = couponPercentage.trim();
    couponType = couponType.trim();
    couponValidity = couponValidity.trim();

    try {
        // Check if the coupon code already exists
        const existingCoupon = await couponDb.findOne({ couponCode });

        if (existingCoupon) {
            // Coupon code already exists, render the add coupon page with an error message
            return res.render('admin/couponAdd', { Message: "Coupon already exists." });
        }

        // Create a new coupon document
        const newCoupon = await couponDb.create({
            couponCode,
            couponPercentage,
            couponType,
            couponValidity
        });

        // Fetch updated coupon data
        const couponData = await couponDb.find();

        // Redirect to the coupon list page after successful creation
        res.render('admin/couponList',{couponData,user});
    } catch (error) {
        // Handle any errors that occur during coupon creation
        console.error('Error creating coupon:', error);
        return res.status(500).send('Internal Server Error');
    }
};

exports.couponEdit = async (req, res) => {
    try {
        const user = req.session.user;
        const couponId = req.params._id;
        const couponData = await couponDb.find({ _id: couponId });
        console.log(couponData);
        res.render('admin/couponEdit', { coupon: couponData[0], user: user });
    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.couponUpdate = async (req, res) => {
    const couponId = req.params._id;
    const user = req.session.user;
    const couponData = await couponDb.find();
    
    let { couponCode, couponType, couponValidity } = req.body;
    const existingCoupon = await couponDb.findOne({ couponCode });

    if (existingCoupon) {
        // Coupon code already exists, render the add coupon page with an error message
        return res.render('admin/couponEdit', { coupon: couponData, Message: "Coupon already exists." });
    }
    couponType = couponType.trim();
    couponValidity = couponValidity.trim();
    const dataToInsert = {
        couponCode,
        couponType,
        couponValidity
    }
    try {
        // Create a new coupon document
        const newCoupon = await couponDb.updateMany({ _id: couponId }, { $set: dataToInsert });
 
        if (newCoupon) {
            // Redirect to the coupon list page after successful creation
            res.render('admin/couponList', { couponData, user });
        } else {
            // Handle if creation fails
            return res.status(500).send('Failed to create coupon.');
        }
    } catch (error) {
        // Handle any errors that occur during coupon creation
        console.error('Error creating coupon:', error);
        return res.status(500).send('Internal Server Error');
    }
}

exports.coupondelete = async (req, res) => {
    try {
        const couponId = req.params._id;
        const user = req.session.user;
        await couponDb.deleteOne({ _id: couponId });
        const couponData = await couponDb.find();
        res.render('admin/couponList',{couponData, user });
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).send('Failed to delete coupon.');
    }
}