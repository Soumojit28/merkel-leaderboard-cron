const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userAddress: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  rank: {
    type: Number,
    default: 0
  }
});

const User = mongoose.model('LeaderBoard', userSchema);

module.exports = User;