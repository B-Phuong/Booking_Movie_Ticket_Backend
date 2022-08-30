const Movie = require("../models/Movie");
const ShowTime = require("../models/Showtime");
const Room = require("../models/Room");
const Movietheater = require("../models/Movietheater");
const TicketBooking = require('../models/TicketBooking');
const jwt = require('jsonwebtoken');
const sendEmail = require("../services/emailServices");
const emailServices = require("../services/emailServices");
const User = require("../models/User");

class ShowTimeController {
  formatDate = (date) => {
    if (date) {
      const d = new Date(date); //d.toLocaleString("en-AU")//
      return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
    }
    return "";
  };
  formatTime = (date) => {
    if (date) {
      const d = new Date(date); //d.toLocaleString("en-AU")//
      const time = d.toLocaleString("en-AU", {
        hour: "numeric",
        minute: "numeric",
      });
      return time;
    }
    return "";
  };
  //[POST] /movie/:bidanh/showtime
  async add(req, res) {
    let ngaychieu = new Date(req.body.ngayChieu);
    console.log("ngày chiếu phim", ngaychieu);
    let showtime = new ShowTime({
      ...req.body,
      gioKetThuc: new Date(req.body.ngayChieu),
    });
    const movie = await Movie.findOne({ biDanh: req.params.bidanh }).populate('lichChieu'); //
    if (movie) {
      if (0 < ngaychieu.getHours() && ngaychieu.getHours() < 9) {
        return res
          .status(400)
          .json({ error: "Hãy chọn lịch trong khung giờ từ 9h sáng tới 12h đêm" });
      }
      const hour = ngaychieu.getHours() + movie.thoiLuong / 60; //
      const minute = ngaychieu.getMinutes() + (movie.thoiLuong % 60); //
      showtime.gioKetThuc.setHours(hour);
      showtime.gioKetThuc.setMinutes(minute);
    }
    if (movie.ngayKhoiChieu > ngaychieu)
      return res
        .status(400)
        .json({ error: "Không thể tạo ngày chiếu sớm hơn ngày khởi chiếu" });
    else {
      const availableShowtime = await ShowTime.find({
        tenRap: showtime.tenRap,
        tenCumRap: showtime.tenCumRap,
      });
      await movie.lichChieu.forEach(async (st) => {
        if (st.ngayChieu.toLocaleString("en-AU") == showtime.ngayChieu.toLocaleString("en-AU") && st.tenCumRap === showtime.tenCumRap) {
          console.log('id rạp trùng', st.tenCumRap, showtime.tenCumRap)
          console.log('giờ chiếu trùng', st.ngayChieu, showtime.ngayChieu)
          return res.status(400).json({ error: "Một rạp khác trong cụm rạp có phim trùng giờ chiếu, vui lòng chọn thời gian khác" });
        }
      })
      if (new Date(showtime.ngayChieu) < Date.now())
        return res.status(400).json({ error: "Giờ tạo lịch chiếu phải lớn hơn thời gian hiện tại" });
      var count = 0;
      availableShowtime.forEach((st) => {
        if (
          st.ngayChieu <= showtime.ngayChieu &&
          st.gioKetThuc >= showtime.ngayChieu
        ) {
          count++;
          console.log("đếm", count);
          return res.status(400).json({
            error:
              "Không thể tạo lịch chiếu cho phim do rạp đang có lịch chiếu khác",
          });
        }
      });
      if (count == 0) {
        const newShowtime = await showtime.save();
        if (newShowtime) {
          const id = newShowtime._id;
          console.log(id, "id của lịch chiếu");
          const addShowtimeToMovie = await Movie.findOne({
            biDanh: req.params.bidanh,
          });
          const LichChieu = addShowtimeToMovie.lichChieu;
          addShowtimeToMovie.lichChieu = [...LichChieu, id];
          //  addShowtimeToMovie.soLuongBan = addShowtimeToMovie.soLuongBan + 1;
          const Successful = await addShowtimeToMovie.save();
          if (Successful)
            res.status(201).json({ message: "Tạo lịch chiếu thành công", data: newShowtime });
          else {
            res.status(400).json({ error: "Tạo lịch chiếu thất bại" });
          }
        } else {
          res.status(400).json({ error: "Không thể tạo lịch chiếu cho phim" });
        }
      }
    }
  }

  //[GET]
  getAllChair(req, res) {
    Room.find({})
      .then((data) => {
        if (data) res.status(200).json(data);
        else {
          res.status(400).json({ error: "Dữ liệu đang trục trặc" });
        }
      })
      .catch((err) => {
        res.status(400).json({ error: "Vui lòng thử lại" });
      });
  }
  //GET movie/movietheater
  getMovieTheater(req, res) {
    Movietheater.find()
      .then((data) => {
        if (data.length > 0) {
          res.status(200).json({ data });
        } else res.status(404).json({ error: "Không tìm thấy cụm rạp chiếu" });
      })
      .catch((err) =>
        res.status(500).json({ error: "Hệ thống lỗi, vui lòng chờ" })
      );
  }

  //GET movie/room
  getRoom(req, res) {
    Room.find()
      .then((data) => {
        if (data.length > 0) {
          res.status(200).json({ data });
        } else res.status(404).json({ error: "Không tìm thấy các rạp chiếu" });
      })
      .catch((err) =>
        res.status(500).json({ error: "Hệ thống lỗi, vui lòng chờ" })
      );
  }

  //[POST] /user/:bidanh/showtime/:IDshowtime
  async ticketBooking(req, res) {
    const IDShowTime = req.params.IDshowtime;
    const ticket = req.body.danhSachGhe;
    seatList = [];
    var seatPicked = [];
    const showtime = await ShowTime.findById(IDShowTime);
    if (showtime)
      ticket.forEach((dsGhe) => {
        seatList.push({ maGhe: dsGhe, giaGhe: showtime.giaVe });
        seatPicked.push(dsGhe);
      });
    else (res.status(400).json({ error: 'Vui lòng kiểm tra lại lịch chiếu' }))
    const movie = await Movie.findOne({ biDanh: req.params.bidanh })
    let total;
    // if (rewardPoints == 0) {
    //   tienThanhToan = showtime.giaVe * GheDaChon.length;
    // }
    //else 
    total = showtime.giaVe * seatPicked.length;// - rewardPoints * 1000
    //console.log('movie', movie)
    const booking = new TicketBooking({
      maLichChieu: IDShowTime,
      danhSachVe: seatList,
      tentaiKhoan: req.user,
      phim: movie._id,
      tienThanhToan: total,
    })
    booking
      .save()
      .then(async () => {
        //res.status(200).json('Đặt vé thành công')
        showtime.gheDaChon = [...showtime.gheDaChon, ...seatPicked]
        const numberOfSeat = seatPicked.length
        const ticketBooking = await showtime.save();
        if (ticketBooking) {
          if (movie) {
            movie.soLuongBan = movie.soLuongBan + numberOfSeat;
            movie.save()
              .then(() => {
                res.status(201).json({ tongTien: total })
              })
              .catch()
            /*      User.findOne({ _id: req.user })
                    .then((data) => {
                      if (data) {
                        if (rewardPoints == 0) {
                          // console.log('ĐIỂM THƯỞNG', rewardPoints)
                          data.diemThuong = data.diemThuong + Math.round((showtime.giaVe * GheDaChon.length) / 1000 * 0.05)
                          data.save()
                            .then()
                            .catch()
                        } else {
                          //  console.log('ĐIỂM THƯỞNG', rewardPoints)
                          //data.diemThuong = data.diemThuong - rewardPoints + Math.round((showtime.giaVe * GheDaChon.length - rewardPoints * 1000) / 1000 * 0.05)
                          data.save()
                            .then()
                            .catch()
                        }
                      }
                    })
                    .catch()  */
          }
        } else res.status(500).json({ error: "Chưa thể tiến hành đặt vé" });
      })
      .catch((err) => {
        console.log(err)
        res.status(500).json({ error: "Đặt vé thất bại" });
      });
  }

  goodSales(res) {
    TicketBooking.find({})
      .then((data) => {
        if (data.length > 0) {
          let total = 0;
          data.forEach((showtime) => {
            total += showtime.tienThanhToan;
          });
          res.status(200).json(total);
        }
      })
      .catch((err) => res.status(500).json({ error: "Thử lại sau" }));
  }
}
module.exports = new ShowTimeController();
