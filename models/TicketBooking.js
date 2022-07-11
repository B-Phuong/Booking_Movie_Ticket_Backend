const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require('./User')
const Showtime = require('./Showtime');
const Movie = require('./Movie');
const Ticketbooking = new Schema({
  maLichChieu: { type: String, ref: Showtime },
  danhSachVe: [
    {
      maGhe: { type: String, trim: true }, //unique: true,
      giaGhe: { type: Number, required: true },
    },
  ],
  tentaiKhoan: { type: String, ref: User },
  thoiGianDat: { type: Date, default: Date.now() },
  daHuy: { type: Boolean, default: false },
  daDoi: { type: Boolean, default: false },
  phim: { type: String, ref: Movie },
  danhSachGheDoi: { type: Array },
  tienThanhToan: { type: Number }
  // createAt:{type: Date, default:Date.now},
  // updateAt:{type: Date, default:Date.now},
},
  { timestamps: true }
);
module.exports = mongoose.model("Ticketbooking", Ticketbooking);
