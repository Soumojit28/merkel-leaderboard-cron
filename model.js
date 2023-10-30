const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userAddress: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    required: true
  }
});

const User = mongoose.model('LeaderBoard', userSchema);

module.exports = User;