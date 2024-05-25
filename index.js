const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const bodyparser = require ('body-parser')
const userRoutes  = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}))

app.set('view engine', 'ejs'); // Set EJS as the view engine
app.set('views', path.join(__dirname, 'views')); // Define the folder where your EJS templates are located

app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the "public" folder

 // if you have a public folder for static files
app.use(
  session({
    secret: 'aru04936ch9746752591',
    resave: false,
    saveUninitialized: false,
  })
);

// Set up routes

app.use('/', userRoutes,adminRoutes);


app.use((err,req,res,next)=>
{
  console.log(err.stack);
  res.status(500).send('Something went wrong!');
})

// Start the server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});