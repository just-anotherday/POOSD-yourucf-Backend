// createJWT.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

const secret = process.env.ACCESS_TOKEN_SECRET;

const _createToken = (fn, ln, id) => {
  try {
    // Build the payload. Note we use 'userId' to be consistent.
    const user = { userId: id, firstName: fn, lastName: ln };
    // Sign the token with an expiration of 1 hour.
    const accessToken = jwt.sign(user, secret, { expiresIn: '1h' });
    return { accessToken: accessToken };
  } catch (e) {
    return { error: e.message };
  }
};

exports.createToken = function (fn, ln, id) {
  return _createToken(fn, ln, id);
};

exports.isExpired = function (token) {
  try {
    // jwt.verify will throw an error if token is invalid or expired.
    jwt.verify(token, secret);
    return false;
  } catch (err) {
    // Return true only if the error is about expiration.
    if (err.name === 'TokenExpiredError') {
      return true;
    }
    // For other errors, you might want to rethrow or handle differently.
    throw err;
  }
};

exports.refresh = function (token) {
  // Decode the token (complete: true returns header and payload)
  const ud = jwt.decode(token, { complete: true });
  if (!ud || !ud.payload) {
    return { error: "Invalid token" };
  }
  // Use the same property names as in _createToken.
  const userId = ud.payload.userId;
  const firstName = ud.payload.firstName;
  const lastName = ud.payload.lastName;
  return _createToken(firstName, lastName, userId);
};
