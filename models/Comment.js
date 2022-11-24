const mongoose = require("mongoose");
const Showtime = require("./Showtime");
const User = require("./User");
const Schema = mongoose.Schema;
const Comment = new Schema(
  {
    maNguoiBinhLuan: { type: String, ref: "User" },
    noiDung: { type: String, required: true },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Comment", Comment);
