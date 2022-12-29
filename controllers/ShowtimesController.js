const Movie = require("../models/Movie");
const ShowTime = require("../models/Showtime");
const Room = require("../models/Room");
const Movietheater = require("../models/Movietheater");
const TicketBooking = require("../models/TicketBooking");
const jwt = require("jsonwebtoken");
const sendEmail = require("../services/emailServices");
const emailServices = require("../services/emailServices");
const User = require("../models/User");
const Showtime = require("../models/Showtime");
const PreOrder = require("../models/PreOrder");

class ShowTimeController {
  formatDate(date) {
    if (date) {
      const d = new Date(date); //d.toLocaleString("en-AU")//
      return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
    }
    return "";
  };
  formatTime(date) {
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
    // console.log("ngày chiếu phim", ngaychieu);
    let showtime = new ShowTime({
      ...req.body,
      gioKetThuc: new Date(req.body.ngayChieu),
    });
    const movie = await Movie.findOne({ biDanh: req.params.bidanh }).populate(
      "lichChieu"
    ); //
    if (movie) {
      if (0 < ngaychieu.getHours() && ngaychieu.getHours() < 9) {
        return res.status(400).json({
          error: "Hãy chọn lịch trong khung giờ từ 9h sáng tới 12h đêm",
        });
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
      const listStByTheaterAndRoom = await ShowTime.find({
        tenRap: showtime.tenRap,
        tenCumRap: showtime.tenCumRap,
      });
      await movie.lichChieu.forEach(async (st) => {
        if (
          st.ngayChieu.toLocaleString("en-AU") ==
          showtime.ngayChieu.toLocaleString("en-AU") &&
          st.tenCumRap === showtime.tenCumRap
        ) {
          // console.log('id rạp trùng', st.tenCumRap, showtime.tenCumRap)
          // console.log('giờ chiếu trùng', st.ngayChieu, showtime.ngayChieu)
          return res.status(400).json({
            error:
              "Một rạp khác trong cụm rạp có phim trùng giờ chiếu, vui lòng chọn thời gian khác",
          });
        }
      });
      if (new Date(showtime.ngayChieu) < Date.now())
        return res.status(400).json({
          error: "Giờ tạo lịch chiếu phải lớn hơn thời gian hiện tại",
        });
      var count = 0;
      listStByTheaterAndRoom.forEach((st) => {
        if (
          st.ngayChieu <= showtime.ngayChieu &&
          st.gioKetThuc >= showtime.ngayChieu
        ) {
          count++;
          //  console.log("đếm", count);
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
          //console.log(id, "id của lịch chiếu");
          const addShowtimeToMovie = await Movie.findOne({
            biDanh: req.params.bidanh,
          });
          const LichChieu = addShowtimeToMovie.lichChieu;
          addShowtimeToMovie.lichChieu = [...LichChieu, id];
          //  addShowtimeToMovie.soLuongBan = addShowtimeToMovie.soLuongBan + 1;
          const Successful = await addShowtimeToMovie.save();
          if (Successful)
            res.status(201).json({
              message: "Tạo lịch chiếu thành công",
              data: newShowtime,
            });
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
    let usedPoint = req.body.diemSuDung;
    let foodList = req.body?.danhSachAnUong;
    const ticket = req.body.danhSachGhe;
    var seatList = [];
    var seatPicked = [];
    let showtime = await ShowTime.findById(IDShowTime);
    let exit = false,
      SeatUnavailable;
    if (showtime) {
      ticket.forEach((dsGhe) => {
        if (showtime.gheDaChon.indexOf(dsGhe) != -1) {
          exit = true;
          SeatUnavailable = dsGhe;
          return; // res.status(400).json({ error: `Ghế ${dsGhe} đã có người đặt, vui lòng hãy chọn ghế khác` })
        } else {
          seatList.push({ maGhe: dsGhe, giaGhe: showtime.giaVe });
          seatPicked.push(dsGhe);
        }
      });
    } else res.status(400).json({ error: "Vui lòng kiểm tra lại lịch chiếu" });
    if (exit) {
      // console.log(`>>Ghế ${SeatUnavailable} đã có người đặt, vui lòng hãy chọn ghế khác`, req.body.soThuTu)
      // console.log(`>>request ${req.body.soThuTu} kết thúc lúc`, new Date())
      return res.status(400).json({
        error: `Ghế ${SeatUnavailable} đã có người đặt, vui lòng hãy chọn ghế khác`,
      });
    }
    const movie = await Movie.findOne({ biDanh: req.params.bidanh });
    let total;
    total = showtime.giaVe * seatPicked.length;
    foodList?.map((item) => {
      total += item.soLuong * item.giaTien;
    });
    const booking = new TicketBooking({
      maLichChieu: IDShowTime,
      danhSachVe: seatList,
      danhSachAnUong: foodList,
      tentaiKhoan: req.user,
      phim: movie._id,
      tienThanhToan: total,
      diemSuDung: usedPoint,
    });
    booking
      .save()
      .then(async () => {
        // console.log(">>BOOKING inf", booking)
        showtime.gheDaChon = [...showtime.gheDaChon, ...seatPicked];
        const numberOfSeat = seatPicked.length;
        const ticketBooking = await showtime.save();
        if (ticketBooking) {
          if (movie) {
            movie.soLuongBan = movie.soLuongBan + numberOfSeat;
            movie
              .save()
              .then(() => {
                User.findOne({ _id: req.user })
                  .then((data) => {
                    if (data) {
                      if (usedPoint == 0) {
                        data.diemThuong += Math.round(
                          ((showtime.giaVe * numberOfSeat) / 1000) * 0.05
                        );
                        // console.log(`>>request ${req.body.soThuTu} THÀNH CÔNG, kết thúc lúc`, new Date())
                        data
                          .save()
                          .then(() =>
                            res.status(200).json({
                              message: "Đặt vé thành công",
                              data: data,
                            })
                          )
                          .catch(() =>
                            res.status(500).json({ error: "Đã xảy ra lỗi" })
                          );
                      } else {
                        // console.log('test', (showtime.giaVe * numberOfSeat - usedPoint * 1000) / 1000 * 0.05)
                        data.diemThuong =
                          data.diemThuong -
                          usedPoint +
                          Math.round(
                            ((showtime.giaVe * numberOfSeat -
                              usedPoint * 1000) /
                              1000) *
                            0.05
                          );
                        // console.log('data.diemThuong', data.diemThuong)
                        // console.log(`>>request ${req.body.soThuTu} THÀNH CÔNG, kết thúc lúc`, new Date())
                        data
                          .save()
                          .then(() =>
                            res.status(200).json({
                              message: "Đặt vé thành công",
                              data: data,
                            })
                          )
                          .catch(() =>
                            res.status(500).json({ error: "Đã xảy ra lỗi" })
                          );
                      }
                    }
                  })
                  .catch(() =>
                    res.status(500).json({ error: "Đã xảy ra lỗi" })
                  );
              })
              .catch(() => res.status(500).json({ error: "Đã xảy ra lỗi" }));
          }
        } else res.status(500).json({ error: "Chưa thể tiến hành đặt vé" });
      })
      .catch(async (err) => {
        await TicketBooking.deleteOne({ _id: booking._id });
        // console.log(err)
        return res.status(500).json({ error: "Đặt vé thất bại" });
      });
  }

  async getAllTicketBookings(req, res) {
    let tickets = await TicketBooking.find()
      .populate("maLichChieu")
      .sort({ "maLichChieu.ngayChieu": 1 })
      .populate("tentaiKhoan", "tentaiKhoan");
    // console.log(">> tickets", tickets);
    return res.status(200).json({ data: tickets });
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

  delete(req, res) {
    // console.log(">> req.body.maLichChieu", req.body.maLichChieu);
    ShowTime.findById(req.body.maLichChieu)
      .then(async (data) => {
        // console.log(">> data", data);
        if (data) {
          let isValid = data.gheDaChon.length > 0 ? false : true;
          // console.log(">> isDelete", isValid);
          if (isValid) {
            let showtime = await ShowTime.findByIdAndDelete(
              req.body.maLichChieu
            );
            // console.log(">> showtimee", showtime);
            if (showtime) {
              const movie = await Movie.findOne({
                biDanh: req.params.bidanh,
              });
              const showtimes = movie.lichChieu;
              var index = showtimes.indexOf(showtime._id);
              if (index !== -1) {
                showtimes.splice(index, 1);
              }
              // console.log(">> after remove", showtimes);
              const isSuccessful = await movie.save();
              if (isSuccessful)
                return res.status(200).json({
                  message: "Xóa lịch chiếu thành công",
                  data,
                });
              else {
                // console.log(">> failed");
                return res
                  .status(400)
                  .json({ error: "Xóa lịch chiếu thất bại" });
              }
            }
          }
          return res.status(400).json({ error: "Lịch chiếu đã có người đặt" });
        } else
          return res
            .status(400)
            .json({ error: "Không tìm thấy lịch chiếu để xóa" });
      })
      .catch((err) => res.status(500).json({ error: "Thử lại sau" }));
  }

  async quarterlyRevenue(req, res) {
    let quarter = [
      {
        begin: 1,
        end: 3,
      },
      {
        begin: 4,
        end: 6,
      },
      {
        begin: 7,
        end: 9,
      },
      {
        begin: 10,
        end: 12,
      },
    ];
    let temp = quarter[Number(req.body.quy) - 1];
    // console.log(">>> temp", temp);
    let year = Number(req.body.nam);
    // console.log(">> begin", new Date(year, temp.begin - 1, 1));
    // console.log(">> end", new Date(year, temp.end, 0));
    let begin = new Date(year, temp.begin - 1, 1);
    let end = new Date(year, temp.end, 0);
    let tickets = await TicketBooking.find({
      thoiGianDat: {
        $gt: begin,
        $lte: end,
      },
    }).sort({ thoiGianDat: 1 });

    res.status(200).json({
      data: [{ thoiGianDat: begin }, ...tickets, { thoiGianDat: end }],
    });
  }

  async theaterRevenue(req, res) {
    let tickets = await TicketBooking.find()
      .populate("maLichChieu")
      .sort({ "maLichChieu.ngayChieu": 1 })
      .populate({
        path: "maLichChieu",
        populate: { path: "tenCumRap" },
      })
    let sum = function (items, prop) {
      return items.reduce(function (a, b) {
        return a + b[prop];
      }, 0);
    };
    let revenueByTheater = []
    let theaters = await Movietheater.find({})
    theaters.forEach((theater) => {
      let filterByTheater = tickets.filter((item) => item.maLichChieu?.tenCumRap?.tenCumRap === theater.tenCumRap)
      // console.log(">> theater", theater)
      let total = sum(filterByTheater, 'tienThanhToan')
      // console.log(">> total", total)
      revenueByTheater.push({ theaterName: theater.tenCumRap, total })
    })

    // console.log(">> tickets", tickets);
    return res.status(200).json({ data: revenueByTheater });
  }

  async timelineChart(req, res) {
    let tickets = await TicketBooking.find()
      .populate("maLichChieu", "ngayChieu")
      .sort({ "maLichChieu.ngayChieu": 1 })
    let morning = [{
      start: '5',
      end: '11'
    }]
    let afternoon = [{
      start: '12',
      end: '16'
    }]
    let evening = [{
      start: '17',
      end: '20'
    }]
    let night = [{
      start: '21',
      end: '24'
    }]
    let count = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0
    }
    tickets.forEach((ticket) => {
      let hr = new Date(ticket?.maLichChieu?.ngayChieu).getHours();
      if (hr >= 5 && hr < 12) {
        count["morning"] += 1
      } else if (hr >= 12 && hr < 17) {
        count["afternoon"] += 1
      } else if (hr >= 17 && hr <= 21) {
        count["evening"] += 1
      } else {
        count["night"] += 1
      }
    })

    // console.log(">> count", count);
    return res.status(200).json({ data: count });
  }

  async addListShowtimes(req, res) {
    // console.log(">> req.body", req.body)
    const checkSameValueInList = (st, err) => {
      let showtime = listFailed.find((item) => item.showtime == st)
      if (showtime == undefined)
        listFailed.push({ showtime: st, error: err })
    }
    const getTime = (datetime) => {
      return new Date(datetime).getTime()
    }
    var listShowtimes = req.body
    var listFailed = []
    var listValid = []
    const requests = listShowtimes.map(async (item) => {
      var ngaychieu = new Date(item.ngayChieu);

      var showtime = new ShowTime({
        ngayChieu: ngaychieu,
        tenRap: item.tenRap,
        tenCumRap: item.tenCumRap,
        giaVe: item.giaVe,
        gioKetThuc: new Date(item.ngayChieu),
      });
      const movie = await Movie.findOne({ biDanh: req.params.bidanh }).populate(
        "lichChieu"
      ); //
      const showtimeOfMovie = await Movie.findOne({ biDanh: req.params.bidanh }) //
      if (movie) {
        const hour = ngaychieu.getHours() + movie.thoiLuong / 60; //
        const minute = ngaychieu.getMinutes() + (movie.thoiLuong % 60); //
        showtime.gioKetThuc.setHours(hour);
        showtime.gioKetThuc.setMinutes(minute);
        // Y
      }
      if (movie.ngayKhoiChieu > ngaychieu)
        return checkSameValueInList(item, "Không thể tạo ngày chiếu sớm hơn ngày khởi chiếu")  //listFailed.push({ showtime: item, error: "Không thể tạo ngày chiếu sớm hơn ngày khởi chiếu" })
      else {
        const listStByTheaterAndRoom = await ShowTime.find({
          tenRap: showtime.tenRap,
          tenCumRap: showtime.tenCumRap,
        });
        const listStByTheater = await ShowTime.find({
          tenCumRap: showtime.tenCumRap,
        });
        await movie.lichChieu.forEach(async (st) => {
          if (
            st.ngayChieu.toLocaleString("en-AU") ==
            showtime.ngayChieu.toLocaleString("en-AU") &&
            st.tenCumRap === showtime.tenCumRap
          ) {
            // console.log("-- error Một rạp khác trong cụm rạp có phim trùng")
            return checkSameValueInList(item, "Một rạp khác trong cụm rạp có phim trùng giờ chiếu, vui lòng chọn thời gian khác") // listFailed.push({ showtime: item, error: "Một rạp khác trong cụm rạp có phim trùng giờ chiếu, vui lòng chọn thời gian khác" })
          }
        });
        var count = 0;
        await listStByTheaterAndRoom.forEach((st) => {
          if (showtimeOfMovie.lichChieu.includes(st._id) &&
            (getTime(st.ngayChieu) <= getTime(showtime.gioKetThuc) && getTime(showtime.gioKetThuc) <= getTime(st.gioKetThuc) ||
              getTime(st.ngayChieu) <= getTime(showtime.ngayChieu) && getTime(showtime.ngayChieu) <= getTime(st.gioKetThuc))
          ) {
            count++;
            // console.log("-- error Vui lòng chọn sau")
            const d = new Date(st.gioKetThuc); //d.toLocaleString("en-AU")//
            let time = d.getHours() + ":" + d.getMinutes()
            return checkSameValueInList(item, `Vui lòng chọn sau ${time}`)// listFailed.push({ showtime: item, error: `Vui lòng chọn sau ${st.gioKetThuc}` })
          } else if (
            (getTime(st.ngayChieu) <= getTime(showtime.gioKetThuc) && getTime(showtime.gioKetThuc) <= getTime(st.gioKetThuc) ||
              getTime(st.ngayChieu) <= getTime(showtime.ngayChieu) && getTime(showtime.ngayChieu) <= getTime(st.gioKetThuc))) {
            count++;
            const d = new Date(st.gioKetThuc);
            let time = d.getHours() + ":" + d.getMinutes()
            return checkSameValueInList(item, "Rạp đang sử dụng để chiếu phim, vui lòng chọn thời gian khác")// listFailed.push({ showtime: item, error: `Vui lòng chọn sau ${st.gioKetThuc}` })
          }
        });
        if (count == 0) {
          return listValid.push(showtime)
        }
      }
    })
    Promise.all(requests).then(async () => {
      await Showtime.insertMany(listValid)
      let listNewIDs = []
      listValid.forEach(async (st) => {
        listNewIDs.push(st._id);
      })
      const addShowtimeToMovie = await Movie.findOne({
        biDanh: req.params.bidanh,
      });

      let LichChieu = addShowtimeToMovie?.lichChieu;
      if (listValid.length > 0 && listNewIDs.length == listValid.length) {//
        // console.log(">> listNewIDs", listNewIDs)
        addShowtimeToMovie.lichChieu = [...LichChieu, ...listNewIDs];
        let Successful = await addShowtimeToMovie.save();
        // console.log(">> lichChieu", addShowtimeToMovie.lichChieu)
        if (Successful && listFailed.length == 0)
          res.status(201).json({
            message: "Tạo lịch chiếu thành công",
            data: [],
          });
        else if (Successful && listFailed.length > 0)
          res.status(400).json({
            error: `Tạo thất bại ${listFailed.length}/${listShowtimes.length} lịch chiếu`,
            data: listFailed,
          });
        else {

          return res.status(400).json({ data: listFailed, error: "Tạo lịch chiếu thất bại" });
        }
      }
      else {
        return res.status(400).json({ data: listFailed, error: "Tạo lịch chiếu thất bại" });
      }
      // const Successful = await addShowtimeToMovie.save();

    })

    // const newShowtime = await showtime.save();
    // if (successfulAdd) 
  }

  async pushSlotsPreOrder(req, res) {
    const { gheDangChon, maLichChieu } = req.body
    let checkSameValue = await PreOrder.findOne({ maLichChieu: maLichChieu, gheDangChon: { $in: gheDangChon } }) //
    // console.log(">> check", checkSameValue)
    if (checkSameValue != null) {
      let chosenChairs = checkSameValue.gheDangChon
      const sameChairs = chosenChairs.filter((chair) => {
        return gheDangChon.indexOf(chair) !== -1;
      });
      return res.status(400).json({ error: `${sameChairs} hiện không khả dụng` })
    }
    const preOrder = new PreOrder()
    preOrder.maLichChieu = maLichChieu
    preOrder.gheDangChon = gheDangChon
    preOrder.thoiHan = new Date().setMinutes(new Date().getMinutes() + 2)
    preOrder.maNguoiDat = req.user
    let result = await preOrder.save()
    let showtime = await Showtime.findById(maLichChieu)
    let orginalSlots = showtime.gheDangChon || []
    if (result) {
      showtime.gheDangChon = [...orginalSlots, ...gheDangChon]
      showtime.save()
        .then(() => {
          setTimeout(async () => {
            await PreOrder.findOneAndDelete({ _id: preOrder._id })
            let updateShowtime = await Showtime.findById(maLichChieu)
            let currentSlots = updateShowtime.gheDangChon || []
            gheDangChon.forEach((chair) => {
              var index = currentSlots.findIndex((element) => element == chair);
              if (index !== -1) {
                // console.log(">> ghế đã chọn", chair)
                let newArray = currentSlots.splice(index, 1);
                // console.log(">> new Array", newArray, currentSlots)
                updateShowtime.gheDangChon = currentSlots
              }
            })
            await updateShowtime.save()
          }, 2 * 60 * 1000)
          return res.status(200).json("Lưu thành công!")
        })
        .catch((error) => { return res.status(400).json("Lưu thất bại!") })
    }
  }

  async removeSlotsPreOrder(req, res) {
    const { maLichChieu } = req.body
    let preOrders = await PreOrder.find({ maLichChieu: maLichChieu, maNguoiDat: req.user })
    let showtime = await ShowTime.findById(maLichChieu)

    if (!showtime) {
      return res.status(400).json("Khong tim thay show time")
    }

    const chairList = []
    preOrders.forEach((preOrder) => chairList.push(...preOrder.gheDangChon));
    let gheDangChonCache = showtime.gheDangChon;
    chairList.forEach((chair) => {
      // console.log("REmove chair:", chair)
      gheDangChonCache = gheDangChonCache.filter((ghe) => ghe != chair)
      // console.log("After remove:", gheDangChonCache)
    })
    showtime.gheDangChon = gheDangChonCache
    // console.log(">> showitme gheDangCHon", showtime.gheDangChon)
    await PreOrder.deleteMany({ maLichChieu: maLichChieu, maNguoiDat: req.user })
    await showtime.save()
    return res.status(200).json()
  }
}
module.exports = new ShowTimeController();
