
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Movie = require('./Movie')
const Room = require('./Room')
const Movietheater = require('./Movietheater')

const Showtime = new Schema({
    //maPhim: { type: String, ref: Movie, },//VỪA THÊM
    //thoiLuong: { type: Number },//, required: [true, 'Chưa xác định thời lượng phim'] },
    tenCumRap: { type: String, ref: Movietheater, required: [true, 'Chưa xác định cụm rạp'] },  //required:[true,'Chưa xác định cụm rạp']
    tenRap: { type: String, ref: Room, required: [true, 'Chưa xác định rạp chiếu'] },
    ngayChieu: { type: Date, required: [true, 'Hãy chọn khung giờ chiếu'] }, //unique: true,
    gioKetThuc: { type: Date },
    gheDaChon: {
        type: Array, default: []
        // hangA: { type: Array, default: [] },
        // hangB: { type: Array, default: [] },
        // hangC: { type: Array, default: [] },
        // hangD: { type: Array, default: [] },
        // hangE: { type: Array, default: [] },
        // hangF: { type: Array, default: [] },
        // hangG: { type: Array, default: [] },
        // hangH: { type: Array, default: [] },

    },
    giaVe: { type: Number, required: [true] },

    // cumRapChieu:[{
    //     lichChieu:[{
    //         maRap:{type: String},
    //         tenRap:{type: String},
    //         ngayChieuGioChieu:{type: String},
    //         thoiLuong:{type: String}
    //     }],
    //     maCumRap:{type: String},
    //     tenCumRap:{type: String}
    // }],
    // phim:{type: String, ref:Movie}

    // createAt:{type: Date, default:Date.now},
    // updateAt:{type: Date, default:Date.now},

}, { timestamps: true });
module.exports = mongoose.model('Showtime', Showtime);



// const Showtime = new Schema({
//   thoiLuong: { type: Number, required: [true, 'Chưa xác định thời lượng phim'] },
//   tenCumRap: { type: String, ref: Movietheater, required: [true, 'Chưa xác định cụm rạp'] },  //required:[true,'Chưa xác định cụm rạp']
//   tenRap: { type: String, ref: Room, required: [true, 'Chưa xác định rạp chiếu'] },
//   ngayChieu: { type: Date, unique: true, required: [true, 'Hãy chọn khung giờ chiếu'] }
//   // cumRapChieu:[{
//   //     lichChieu:[{
//   //         maRap:{type: String},
//   //         tenRap:{type: String},
//   //         ngayChieuGioChieu:{type: String},
//   //         thoiLuong:{type: String}
//   //     }],
//   //     maCumRap:{type: String},
//   //     tenCumRap:{type: String}
//   // }],
//   // phim:{type: String, ref:Movie}

//   // createAt:{type: Date, default:Date.now},
//   // updateAt:{type: Date, default:Date.now},

// }, { timestamps: true });