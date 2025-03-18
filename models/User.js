const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true }, 
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  isValidated: { type: Boolean, default: false } // Email verification
});

module.exports = mongoose.model('User', usersSchema);
