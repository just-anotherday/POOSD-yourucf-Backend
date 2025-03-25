// api.js
require('express');
require('mongodb');

// Require our JWT helper module
const createJWT = require("./createJWT.js");

exports.setApp = function (app, client) {
  // Load User and Card models
  const User = require("./models/user.js");
  const Card = require("./models/card.js");

  
}

