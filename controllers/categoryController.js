const { Category } = require('../models/dbconnection');



//CATAEGORY
exports.categorylist = async (req, res) => {
  try {
    let user = req.session.user;
    const category = await Category.find({});
    res.render('admin/categorylist', { user, categoryData: category });

  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).send('Internal Server Error');
  }
};

//CATEGORY ADD RENDER
exports.addcategory = async (req, res) => {
  try {
    let user = req.session.user;
    res.render('admin/categoryadd', { user });
  } catch (error) {
    // Handle the error appropriately, for example, log it or send a specific error response.
    console.error('An error occurred:', error);
    res.status(500).send('Internal Server Error');
  }
}

//CATEGORY ADD
exports.categoryadd = async (req, res) => {

  try {
    const category = req.body.category;
    const exists = await Category.findOne({ category: req.body.category });
    if (exists) {
      res.render('admin/categoryadd', { Message: 'Category already exist' })
    }
    else {
      const categoryResult = await Category.insertMany({ category });
      if (categoryResult) {
        res.redirect('/categorylist');
      } else {
        console.error("Failed to add category");
        res.status(500).json({ error: 'Failed to add category' });
      }
    }
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

//CATEGORY EDIT
exports.categoryedit = async (req, res) => {
  try {
    let user = req.session.user;
    const categoryId = req.params._id;
    const categoryedit = await Category.findOne({ _id: categoryId });
    res.render('admin/categoryedit', { user, categoryData: categoryedit });
  } catch (error) {
    // Handle the error appropriately, for example, log it or send a specific error response.
    console.error('An error occurred:', error);
    res.status(500).send('Internal Server Error');
  }
};

//CATEGORY UPDATE
exports.updatecategory = async (req, res) => {
  try {
    const categoryId = req.params._id;
    let category = req.body.category;
    if (!category || typeof category !== 'string' || category.trim() === '') {
      console.error("Invalid category data");
      return res.status(400).json({ error: 'Invalid category data' });
    }
    const exists = await Category.findOne({ category: req.body.category });
    if (exists) {
      res.render('admin/categoryedit', { categoryData: exists, Message: 'Category already exists' });
    } else {
      const categoryResult = await Category.updateOne({ _id: categoryId }, { $set: { category } });

      if (categoryResult) {
        res.redirect('/categorylist');
      }
    }

  } catch (error) {
    // Handle the error appropriately, for example, log it or send a specific error response.
    console.error('An error occurred:', error);
    res.status(500).send('Internal Server Error');
  }
};

//CATEGORY DELETE
exports.deletecategory = async (req, res) => {
  try {
    let user = req.session.user;
    const categoryId = req.params._id;
    const categoryResult = await Category.deleteOne({ _id: categoryId });
    if (categoryResult.deletedCount > 0) {
      res.redirect('/categorylist');
    }

  } catch (error) {
    // Handle the error appropriately, for example, log it or send a specific error response.
    console.error('An error occurred:', error);
    res.status(500).send('Internal Server Error');
  }
};

//CATEGORY LOGOUT
exports.adminlogout = async (req, res) => {
  try {
    delete req.session.adminloggedIn;
    res.redirect('/adminlogin');
  } catch (error) {
    // Handle the error appropriately, for example, log it or send a specific error response.
    console.error('An error occurred:', error);
    res.status(500).send('Internal Server Error');
  }
};
