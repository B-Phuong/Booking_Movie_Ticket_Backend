const mongoose = require("mongoose");
const Showtime = require("./Showtime");
const User = require("./User");
const Schema = mongoose.Schema;
const PreOrder = new Schema(
    {
        maLichChieu: { type: String },
        thoiHan: { type: Date },
        gheDangChon: { type: Array },
    },
    { timestamps: true }
);

module.exports = mongoose.model("PreOrder", PreOrder);
