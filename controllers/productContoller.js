const {Product,Category} = require('../models/dbconnection');
// const ImageUpload = require('../models/imageDb');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

//PRODUCT DISPLAY
exports.productlist = async(req,res)=>
{
  try {
  
    let user = req.session.user;
  
      const product = await Product.find().populate('genres');
      res.render('admin/productlist', { user, productData: product });
   
  } catch (error) {
    // Handle the error appropriately, for example, log it or send a specific error response.
    console.error('An error occurred:', error);
    res.status(500).send('Internal Server Error');
  }  
  
}
//PRODUCT ADD
exports.addproduct = async (req, res) => {
  try {
      let user = req.session.user;
    
        const category = await Category.find({});
        if(category)
        {
          res.render('admin/productadd',{user,categoryData: category});
        }
     
      } catch (error) 
      {
        console.error('Error fetching genres data:', error);
        res.status(500).send('Internal Server Error');
      }

};

//PRODUCT UPLOAD
exports.productadd = async function (req, res,next)  {
  try {
    let user = req.session.user;
   
      const images = req.files;
      const imageArray = [];
      for (const image of images) {
        const filePath = path.join(__dirname, '..', 'uploads', image.filename);
       
        const imageData = {
          data: fs.readFileSync(filePath),
          contentType: image.mimetype,
          filename: image.filename
        };
        imageArray.push(imageData);
      }
    

      let { bookName, bookDetail, author, publisher, stock } = req.body;
      const { price, publishedDate } = req.body;
      const genres = req.body.productCategory;
      // Only trim string values
      bookName = bookName.trim();
      bookDetail = bookDetail.trim();
      author = author.trim();
      publisher = publisher.trim();
      stock = stock.trim();
      // const img0 = images[0].filename;
      // const img1 = images[1].filename;
      // const img2 = images[2].filename;
      const dataToInsert = {
        bookName,
        bookDetail,
        author,
        publisher,
        price,
        stock,
        genres,
        publishedDate,
        // img0,img1,img2,
        images: imageArray
      };
      
      // const imgresult = await ImageUpload.imageUpload.insertMany([imgData]);
      const result = await Product.insertMany([dataToInsert]);
      if (result) {
        res.redirect('/productlist');
      }
   
  } catch (error) {
    // Handle the error appropriately, for example, log it or send a specific error response.
    console.error('An error occurred:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }  
};

  //PRODUCT EDIT
  exports.productedit = async (req,res) =>
  {
    try {
      let user = req.session.user;
     
        const productId = req.params._id;
        const productedit = await Product.findOne({ _id: productId }).populate('genres');
        const category = await Category.find({});
        res.render('admin/productedit', { user, categoryData: category, productData: productedit });
     
    } catch (error) {
      // Handle the error appropriately, for example, log it or send a specific error response.
      console.error('An error occurred:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
}

  //PRODUCT UPDATE
  exports.updateproduct = async function (req, res, next) {
    try {
      let user = req.session.user;
     
        const productId = req.params._id;
        if (!req.files || req.files.length === 0) {
          return res.status(400).json({ error: 'No file uploaded' });
        }
        const images = req.files;
        const imageArray = [];
        for (const image of images) {
          const filePath = path.join(__dirname, '..', 'uploads', image.filename);
          const imageData = {
            data: fs.readFileSync(filePath),
            contentType: image.mimetype,
            filename: image.filename
          };
          imageArray.push(imageData);
        }
        let { bookName, bookDetail, author, publisher, productCategory, stock } = req.body;
        const { price, publishedDate } = req.body;
        bookName = bookName.trim();
        bookDetail = bookDetail.trim();
        author = author.trim();
        publisher = publisher.trim();
        stock = stock.trim();
        const genres = productCategory;
        
        const dataToInsert = {
          bookName,
          bookDetail,
          author,
          publisher,
          price,
          stock,
          genres,
          publishedDate,
          images: imageArray
        };
        const result = await Product.updateOne({ _id: productId }, { $set: dataToInsert });
        res.redirect('/productlist');
      
    } catch (error) {
      console.error('An error occurred:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } 
  };
  
  //PRODUCT DELETE
  exports.deleteproduct = async (req,res) =>
  {
    try {
      let user = req.session.user;
     
  
        const deleteId = req.params._id;
      
        const result = await Product.deleteOne({ _id: deleteId });
        if (result.deletedCount > 0) {
          res.redirect('/productlist');
        } else {
          res.send("Not deleted");
        }
     
    } catch (error) {
      // Handle the error appropriately, for example, log it or send a specific error response.
      console.error('An error occurred:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }    
};

exports.imageDelete = async(req,res) =>
{
  try {
    let user = req.session.user;
    const productId = req.params._id;
  
    const imgFN = await Product.findOne({ _id: productId });
  
    // Delete the file from the filesystem
    const filePath = 'D:/MyProject/Project/uploads/' + imgFN.images[0].filename;
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(`Error deleting file: ${err}`);
      } else {
        console.log(`File ${filePath} has been successfully deleted`);
      }
    });
  
    // Remove the image reference from the product
    const result = await Product.updateOne(
      { _id: productId },
      { $pull: { images: { _id: imgFN.images[0]._id } } }
    );
    if (result) {
      // Fetch the updated product data and category data
      const productedit = await Product.findOne({ _id: productId });
      const category = await Category.find({});
      res.render('admin/productedit', { user, categoryData: category, productData: productedit, Message: 'Image deleted' });
    }
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
  
 
}

  //PRODUCT LOGOUT
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
  