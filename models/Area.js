const mongoose = require('mongoose');

// Categorizes courses into areas such as Systems, AI, Graphics, Algorithms, etc.
const areasSchema = new mongoose.Schema({
  areaName: { type: String, required: true, unique: true },
  description: { type: String },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
});

module.exports = mongoose.model('Area', areasSchema);


