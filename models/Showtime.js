
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Movie = require('./Movie')
const Room = require('./Room')
const Movietheater = require('./Movietheater')

const Showtime = new Schema({
    tenCumRap: { type: String, ref: Movietheater, required: [true, 'Chưa xác định cụm rạp'] },  //required:[true,'Chưa xác định cụm rạp']
    tenRap: { type: String, ref: Room, required: [true, 'Chưa xác định rạp chiếu'] },
    ngayChieu: { type: Date, required: [true, 'Hãy chọn khung giờ chiếu'] }, //unique: true,
    gioKetThuc: { type: Date },
    gheDaChon: {
        type: Array, default: []
    },
    giaVe: { type: Number, required: [true] },
}, { timestamps: true });
module.exports = mongoose.model('Showtime', Showtime);