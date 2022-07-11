const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Movietheater = new Schema({
  tenCumRap:{type: String},  //required:[true,'Chưa xác định cụm rạp']
  //tenRap:{type: String},

}, { timestamps: true });
module.exports = mongoose.model('Movietheater', Movietheater);
