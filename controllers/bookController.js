const {Product} = require('../models/dbconnection');
const authUser = require('../models/authUser');
const url = require('url');
const querystring = require('querystring');

const ITEMS_PER_PAGE = 5; // Number of items to display per page

  const getPaginationInfo = (totalItems, currentPage) => {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return {
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
  };
};

//BOOKVIEW
exports.bookview = async (req, res) => {
    //
    try {
      const user = req.session.normaluser;
      const userStatus = await authUser.findOne({ email: user });
      const currentPage = parseInt(req.query.page) || 1;
      const totalBooks = await Product.countDocuments();
      const skip = (currentPage - 1) * ITEMS_PER_PAGE;
      const bookViews = await Product.find().populate('genres').skip(skip).limit(ITEMS_PER_PAGE);
      const paginationInfo = getPaginationInfo(totalBooks, currentPage);
  
      res.render('user/bookview', { user, bookViews, paginationInfo });
    } catch (error) {
      console.error('Unexpected error in the bookview route:', error);
      res.status(500).send('Internal Server Error');
    }
  };

  //BOOK DETAILS PAGE
exports.bookdetails = async (req,res) => {
    try {
      let user = req.session.normaluser;
      const userStatus = await authUser.findOne({ email: user });
   
          const bookId = req.params._id;
          const bookName = req.params.name;
          const bookresult = await Product.find({ bookName: bookName }).populate('genres');
    
          if (bookresult) {
       
            res.render('user/bookdetails', { user, bookViews: bookresult });
          } else {
            res.status(404).send('Book not found'); // Handle the case where the book is not found
          }


    } catch (error) {
      console.error('Error in the book details route:', error);
      res.status(500).send('Internal Server Error');
    }
  };

  //SORT

exports.yearWise = async(req, res) =>{
    const user = req.session.normaluser;
    const sort = {bookName:1};
    const currentPage = parseInt(req.query.page) || 1;
    const totalBooks = await Product.countDocuments();
    const skip = (currentPage - 1) * ITEMS_PER_PAGE;
    const bookViews = await Product.find().populate('genres').sort(sort).skip(skip).limit(ITEMS_PER_PAGE);
    const paginationInfo = getPaginationInfo(totalBooks, currentPage);

    res.render('user/bookview', { user, bookViews, paginationInfo });
  }
  
exports.priceWise = async(req, res) =>{
    const user = req.session.normaluser;
    const sort = {price:1};
    const currentPage = parseInt(req.query.page) || 1;
    const totalBooks = await Product.countDocuments();
    const skip = (currentPage - 1) * ITEMS_PER_PAGE;
    const bookViews = await Product.find().populate('genres').sort(sort).skip(skip).limit(ITEMS_PER_PAGE);
    const paginationInfo = getPaginationInfo(totalBooks, currentPage);

    res.render('user/bookview', { user, bookViews, paginationInfo });
  }

exports.highPriceWise = async(req, res) =>{
    const user = req.session.normaluser;
    const sort = {price:-1};
    const currentPage = parseInt(req.query.page) || 1;
    const totalBooks = await Product.countDocuments();
    const skip = (currentPage - 1) * ITEMS_PER_PAGE;
    const bookViews = await Product.find().populate('genres').sort(sort).skip(skip).limit(ITEMS_PER_PAGE);
    const paginationInfo = getPaginationInfo(totalBooks, currentPage);

    res.render('user/bookview', { user, bookViews, paginationInfo });
  }

  //FILTER
  exports.poemOnly = async (req, res) => {
    const user = req.session.normaluser;
    const filter = { category: 'Poem' };
    const ITEMS_PER_PAGE = 10;
    const parsedUrl = url.parse(req.url);
    const queryParams = querystring.parse(parsedUrl.query);
    try {
      const totalBooks = await Product.countDocuments(filter);
      const currentPage = parseInt(req.query.page) || 1;
      const skip = (currentPage - 1) * ITEMS_PER_PAGE;

      const searchText = queryParams.searchText;
      const query = { $text: { $search: searchText } };
    
      const bookViews = await Product.aggregate([
        {
          $lookup: {
            from: 'categories',
            localField: 'genres',
            foreignField: '_id',
            as: 'genresInfo'
          }
        },
        {
          $unwind: '$genresInfo'
        },
        {
          $match: { 'genresInfo.category': filter.category }
        }
      ]).skip(skip).limit(ITEMS_PER_PAGE);
  
      const paginationInfo = getPaginationInfo(totalBooks, currentPage);

      const matchingBooks = searchText ? bookViews.filter(book => book.bookName.toLowerCase().includes(searchText.toLowerCase())) : bookViews;
    
      if (matchingBooks.length > 0) {
        res.render('user/onlyPoem', { user, bookViews : matchingBooks, paginationInfo});
       
      }
     
      else {
        res.render('user/onlyPoem', { user, bookViews: matchingBooks, paginationInfo});
      }
      
    } catch (error) {
      console.error('Error in onlyPoem:', error);
      res.status(500).send('Internal Server Error');
    }
  };
  

exports.storyOnly = async (req, res) => {
    const user = req.session.normaluser;
    const filter = { category: 'Story' };
    const currentPage = parseInt(req.query.page) || 1;
    const totalBooks = await Product.countDocuments(filter);
    const ITEMS_PER_PAGE = 10;

    const parsedUrl = url.parse(req.url);
    const queryParams = querystring.parse(parsedUrl.query);

    const searchText = queryParams.searchText;

    const skip = (currentPage - 1) * ITEMS_PER_PAGE;
    try {
      const bookViews = await Product.aggregate([
        {
          $lookup: {
            from: 'categories',
            localField: 'genres',
            foreignField: '_id',
            as: 'genresInfo'
          }
        },
        {
          $unwind: '$genresInfo'
        },
        {
          $match: { 'genresInfo.category': filter.category }
        }
      ]).skip(skip).limit(ITEMS_PER_PAGE);
  
      const paginationInfo = getPaginationInfo(totalBooks, currentPage);

      const matchingBooks = searchText? await bookViews.filter(book => book.bookName.toLowerCase().includes(searchText.toLowerCase())): bookViews;
  
      if (matchingBooks.length > 0) {
        res.render('user/onlyStory', { user, bookViews : matchingBooks, paginationInfo});
        console.log("1")
      }
      
      else {
        res.render('user/onlyStory', { user, bookViews: matchingBooks, paginationInfo, Message:'No books found'});
        console.log("2")
      }
    } catch (error) {
      console.error('Error in storyOnly:', error);
      res.status(500).send('Internal Server Error');
    }
  };

exports.price100to500 = async (req, res) => {
  const user = req.session.normaluser;
  const filter = {
    minPrice: 100, // Set your minimum price
    maxPrice: 500 // Set your maximum price
  };
  const currentPage = parseInt(req.query.page) || 1;
  const totalBooks = await Product.countDocuments(filter);
  const ITEMS_PER_PAGE = 10;
  const skip = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const bookViews = await Product.aggregate([
      
      {
        $match: {
          price: { $gte: filter.minPrice, $lte: filter.maxPrice }
        }
      }
    ]).skip(skip).limit(ITEMS_PER_PAGE);
    console.log(filter.minPrice);
    console.log(filter.maxPrice);
    const paginationInfo = getPaginationInfo(totalBooks, currentPage);

    res.render('user/bookview', { user, bookViews, paginationInfo });
  } catch (error) {
    console.error('Error in novalOnly:', error);
    res.status(500).send('Internal Server Error');
  }
  };

exports.bookSearch = async (req, res) => {
  const user = req.session.normaluser;
  const searchText = req.body.searchText;
  const query = { $text: { $search: searchText } };

  const urlData = req.url;

  const projection = {
      _id: 1,
      bookName: 1,
      price:1,
      bookDetail:1,
      author:1,
      publisher:1,
      genres:1,
      year:1,
      images:1,
  };

  if(urlData=="/poemOnly")
  {
    console.log(hai);
  }

  try {
      const currentPage = parseInt(req.query.page) || 1;
      const totalBooks = await Product.countDocuments();
      const paginationInfo = getPaginationInfo(totalBooks, currentPage);
      const bookViews = await Product.find(query).select(projection);
      
      res.render('user/bookview', { user, bookViews, paginationInfo});
     
  } catch (error) {
      console.error('Error during book search:', error);
      res.status(500).send('Internal Server Error');
  }
  };

