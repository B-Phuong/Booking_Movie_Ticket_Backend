const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Room = new Schema({
  tenRap: { type: String },
  ghe: {
    Array
    // hangA: Array,
    // hangB: Array,
    // hangC: Array,
    // hangD: Array,
    // hangE: Array,
    // hangF: Array,
    // hangG: Array,
    // hangH: Array,

  }
  // updateAt:{type: Date, default:Date.now},

}, { timestamps: true });
module.exports = mongoose.model('Room', Room);
