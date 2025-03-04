require('dotenv').config();

// requirements 
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  next();
});

// initialize database connection
const uri = process.env.MONGODB_URI;
console.log(uri)
const mongoose = require("mongoose");
mongoose.connect(uri)
.then(() => console.log("Mongo DB connected"))
.catch(err => console.log(err));

// initialize api
var api = require('./api.js')
api.setApp( app, mongoose );

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS'
    );

    next();
});

// start Node + Express server on port 5000
app.listen(5000, '0.0.0.0', () => {
    console.log("Server is running on port 5000")
}); 