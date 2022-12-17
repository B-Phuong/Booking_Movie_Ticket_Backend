const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const FoodsAndDrink = new Schema({
    tenCombo: { type: String, unique: true, required: [true, 'Bạn chưa nhập tên thức ăn/ đồ uống'] },
    moTa: { type: String, required: true },
    biDanh: { type: String },
    ghiChu: { type: String },
    hinhAnh: { type: String },
    maHinhAnh: { type: String },
    giaGoc: { type: Number },
    giamGia: { type: Number, default: 0 },
    soLuongBan: { type: Number, default: 0 },
    daXoa: { type: Boolean, default: "false" }
}, { timestamps: true })
module.exports = mongoose.model('FoodsAndDrink', FoodsAndDrink);