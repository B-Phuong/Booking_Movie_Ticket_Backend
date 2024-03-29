const mongoose = require('mongoose');
const validator = require('validator');
const Schema = mongoose.Schema;
require('dotenv').config()

const User = new Schema({
  tentaiKhoan: { type: String, maxlength: 80, unique: true, trim: true, required: [true, 'Hãy nhập tên đăng nhập'] },
  matKhau: { type: String, minlength: [6, 'Mật khẩu tối thiểu 6 ký tự'], trim: true, required: [true, 'Bạn chưa nhập mật khẩu']},
  email: { type: String, unique: true, required: [true, 'Hãy nhập email'], trim: true, lowcase: true, validate: [validator.isEmail, 'Nhập đúng kiểu mail'] },
  hoTen: { type: String },
  SDT: { type: String },
  maLoaiNguoiDung: { type: String, default: '1' },
  diemThuong: { type: Number, default: '0' },
  anhDaiDien: { type: String, default: process.env.AVATAR_DEFAULT_URL },
  maHinhAnh: { type: String },
}, { timestamps: true });
module.exports = mongoose.model('User', User);
