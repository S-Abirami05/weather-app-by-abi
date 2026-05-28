const mongoose = require('mongoose');

const SearchSchema = new mongoose.Schema({
  city: String,
  temperature: Number,
  humidity: Number,
  wind: Number,
  searchedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Search', SearchSchema);