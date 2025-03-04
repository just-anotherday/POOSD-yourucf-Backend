// api.js
require('express');
require('mongodb');

// Require our JWT helper module
const createJWT = require("./createJWT.js");

exports.setApp = function (app, client) {
  // Load User and Card models
  const User = require("./models/user.js");
  const Card = require("./models/card.js");

  // LOGIN ENDPOINT
  app.post('/api/login', async (req, res, next) => {
    try {
      // incoming: login, password
      // outgoing: id, firstName, lastName, jwtToken, error
      const { login, password } = req.body;
      const results = await User.find({ Login: login, Password: password });
  
      let ret = {};
      if (results.length > 0) {
        const id = results[0].UserId;
        const fn = results[0].FirstName;
        const ln = results[0].LastName;
        
        // Generate JWT token using the createToken function
        const tokenObj = createJWT.createToken(fn, ln, id);
        if (tokenObj.error) {
          ret = { error: tokenObj.error };
        } else {
          ret = { id: id, firstName: fn, lastName: ln, jwtToken: tokenObj.accessToken, error: "" };
        }
      } else {
        ret = { error: "Login/Password incorrect" };
      }
      
      res.status(200).json(ret);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  // ADD CARD ENDPOINT
  app.post('/api/addcard', async (req, res, next) => {
    // incoming: userId, card, jwtToken
    // outgoing: error, jwtToken (refreshed)
    const { userId, card, jwtToken } = req.body;

    try {
      if (createJWT.isExpired(jwtToken)) {
        res.status(200).json({ error: 'The JWT is no longer valid', jwtToken: '' });
        return;
      }
    } catch (e) {
      console.log("JWT expiration check error:", e.message);
    }

    const newCard = new Card({ Card: card, UserId: userId });
    let error = '';
    try {
      await newCard.save();
    } catch (e) {
      error = e.toString();
    }

    let refreshedToken = null;
    try {
      refreshedToken = createJWT.refresh(jwtToken);
    } catch (e) {
      console.log("JWT refresh error:", e.message);
    }

    const ret = { error: error, jwtToken: refreshedToken };
    res.status(200).json(ret);
  });

  // SEARCH CARDS ENDPOINT
  app.post('/api/searchcards', async (req, res, next) => {
    // incoming: userId, search, jwtToken
    // outgoing: results[], error, jwtToken (refreshed)
    let error = '';
    const { userId, search, jwtToken } = req.body;

    try {
      if (createJWT.isExpired(jwtToken)) {
        res.status(200).json({ error: 'The JWT is no longer valid', jwtToken: '' });
        return;
      }
    } catch (e) {
      console.log("JWT expiration check error:", e.message);
    }

    const _search = search.trim();
    // Find cards matching the search (case-insensitive)
    const results = await Card.find({ "Card": { $regex: _search + '.*', $options: 'i' } });

    const _ret = results.map(item => item.Card);

    let refreshedToken = null;
    try {
      refreshedToken = createJWT.refresh(jwtToken);
    } catch (e) {
      console.log("JWT refresh error:", e.message);
    }

    const ret = { results: _ret, error: error, jwtToken: refreshedToken };
    res.status(200).json(ret);
  });
};
