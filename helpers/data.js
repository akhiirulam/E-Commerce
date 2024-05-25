const Order = require('../models/orderDb');

module.exports = async () => {
    try {
        const productData = await Order.find({});
        if (productData.length > 0) {
            // Assuming Order.find() returns an array of orders, you might want to process it accordingly
            const names = productData.map(order => order.bookName);
            return { names };
        } else {
            return { names: [] }; // Return an empty array if no data is found
        }
    } catch (error) {
        console.error('Error fetching product data:', error);
        throw error; // Propagate the error to the caller
    }
};
