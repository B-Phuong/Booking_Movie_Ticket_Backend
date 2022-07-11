const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator')
const Showtime = require('./Showtime')
mongoose.plugin(slug)
const Schema = mongoose.Schema;

const Movie = new Schema({
  //maPhim: { type: Number, maxlength: 255, unique: true, required: [true, 'Hãy nhập tên đăng nhập'] },
  tenPhim: { type: String, trim: true, unique: true, maxlength: 600, uppercase: true, required: [true, 'Bạn chưa nhập tên phim'] },
  biDanh: { type: String, unique: true, slug: 'tenPhim', maxlength: 100 },
  hinhAnh: { type: String },
  moTa: { type: String },
  trailer: { type: String },
  ngayKhoiChieu: { type: Date, required: true },
  ngayKetThuc: { type: Date },
  lichChieu: { type: Array, ref: "Showtime", default: [] },//[Showtime],
  thoiLuong: { type: Number },
  // thoiLuong: { type: Number, required: [true, 'Bạn chưa chọn thời lượng phim'] },
  // tenCumRap: { type: String, required: [true, 'Bạn chưa chọn cụm rạp'] },
  // tenRap: { type: String, required: [true, 'Bạn chưa chọn chỗ rạp chiếu'] },
  // ngayChieu: { type: Date, required: [true, 'Vui lòng chọn thời điểm sẽ chiếu'] }

  //], //mới thêm
  danhGia: { type: Number, default: 0 },
  soLuongBan: { type: Number, default: 0 },
  daXoa: { type: Boolean, default: false }


}, { timestamps: true });
module.exports = mongoose.model('Movie', Movie);
