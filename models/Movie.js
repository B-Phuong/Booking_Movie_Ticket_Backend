const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");
const Showtime = require("./Showtime");
const User = require("./User");
const Comment = require("./Comment");
mongoose.plugin(slug);
const Schema = mongoose.Schema;
const Movie = new Schema(
  {
    tenPhim: {
      type: String,
      trim: true,
      unique: true,
      maxlength: 600,
      uppercase: true,
      required: [true, "Bạn chưa nhập tên phim"],
    },
    biDanh: { type: String, unique: true, maxlength: 100 },
    hinhAnh: { type: String },
    maHinhAnh: { type: String },
    moTa: { type: String },
    trailer: { type: String },
    ngayKhoiChieu: { type: Date, required: true },
    ngayKetThuc: { type: Date },
    lichChieu: { type: Array, ref: "Showtime", default: [] }, //[Showtime],
    thoiLuong: { type: Number },
    danhGia: { type: Number, default: 0 },
    soLuongBan: { type: Number, default: 0 },
    daXoa: { type: Boolean, default: false },
    theLoai: { type: Array, default: "Chưa xác định" },
    quocGia: { type: String, default: "Chưa xác định" },
    anhBia: { type: String, required: true },
    maAnhBia: { type: String },
    nguoiDanhGia: { type: Array, ref: "User", default: [] },
    binhLuan: { type: Array, ref: "Comment", default: [] },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Movie", Movie);

// theLoai: Kinh dị, Hài hước, Lãng mạn, Hành động, Hoạt hình, Viễn tưởng
// quocGia: Mỹ, Việt Nam, Anh, Pháp, Nhật, Hàn, Thái Lan, khác
// anhBia: url
// trailer: url video
