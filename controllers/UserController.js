const User = require("../models/User");
const TicketBooking = require("../models/TicketBooking");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Showtime = require("../models/Showtime");

class UserController {
  // với re là reqiure và res là response

  //-----TỪ KHÚC NÀY TRỞ ĐI CHƯA GÁN route-----
  //[GET] /user/info/:id
  info(req, res, next) {
    User.find({ _id: req.user })
      .then((data) => {
        res.status(200).json(data);
      })
      .catch((err) => {
        res
          .status(404)
          .json({ error: "Không tìm thấy thông tin người dùng này" });
        // err = new Error('Không tìm thấy thông tin người dùng này');
        // // err = new Error('Hệ thống đang xử lý, hãy chờ giây lát');
        // err.statusCode = 404
        // return next(err)
      });
  }

  //[GET] /user/find/:tenTaiKhoan
  // async find(req, res, next) {
  //     const data = await User.find({ tentaiKhoan: req.params.tenTaiKhoan })
  //     if (data) res.status(200).json(data)
  //     else {
  //         const err = new Error('Hệ thống đang xủ lý, vui lòng đợi');
  //         err.statusCode = 500
  //         return next(err)
  //     }

  // }

  //[PUT] user/:id
  edit(req, res, next) {
    if (req.body.SDT && req.body.hoTen && req.body.email) {
      User.findByIdAndUpdate(req.user, req.body, { runValidators: true })
        .then(() => {
          res.status(200).json("Bạn đã chỉnh sửa được thông tin!");
        })
        .catch((err) => {
          res.status(400).json("Bạn đã chỉnh sửa thông tin thất bại!");
          //err = new Error('Chỉnh sửa thất bại, không tìm thấy người dùng');
          // err.statusCode = 404;
          // return next(err);
        });
    } else {
      res.status(404).json({ error: "Bạn vẫn còn thiếu thông tin" });
      // const err = new Error('Bạn vẫn còn thiếu thông tin');
      // err.statusCode = 404
      // return next(err)
    }
  }
  //[GET] user/logOut
  logOut(req, res) {
    if (localStorage.getItem("token")) {
      //if (req.cookies.token)
      localStorage.setItem("token", "");
      // res.cookie('token', '', { maxAge: 1 });
      //res.json('Đã đăng xuất')
      //res.json(data)
    } else res.json("Bạn chưa đăng nhập!");
  }
  //[GET] user/search
  find(req, res, next) {
    let filter, query;
    if (req.query.name) {
      filter = req.query.name;
      query = { hoTen: filter };
    } else {
      filter = req.query.tentaiKhoan;
      query = { tentaiKhoan: filter };
    } // Must enter exactly name => not good
    User.find(query) //{ "hoTen": name }
      .then((data) => {
        if (data.length == 0) {
          const err = new Error("Không tìm thấy người dùng");
          err.statusCode = 404;
          return next(err);
        } else {
          res.status(200).json(data);
        }
      })
      .catch((err) => {
        err.statusCode = 404;
        return next(err);
      });
  }

  //[GET] user/:id/history
  history(req, res) {
    // when gets both showtime and info CHẠY ĐƯỢC, NHƯNG NẾU LẤY MỖI thời gian và thông tin lịch chiếu thì 'undetifined'
    TicketBooking.find({ tentaiKhoan: req.user })
      // .populate("tentaiKhoan")
      .populate("phim")
      .populate("maLichChieu")
      .populate({
        path: "maLichChieu",
        populate: { path: "tenCumRap" },
      })
      .populate({
        path: "maLichChieu",
        populate: { path: "tenRap" },
      })
      .then((data) => {
        console.log(data);
        if (data) res.status(200).json(data);
        else {
          res.status(404).json({ error: "Vui lòng thử lại" });
          // const err = new Error('Vui lòng thử lại');
          // err.statusCode = 404
          // return next(err)
        }
      })
      .catch((err) => {
        res.status(500).json({ error: "Vui lòng thử lại" });
      });
  }

  //[GET] /admin/user
  getAllUser(req, res, next) {
    User.find({ maLoaiNguoiDung: "1" })
      .then((data) => {
        //if (data === true)
        res.status(200).json(data);
        // else {
        //     const err = new Error('Không tìm thấy thông tin người dùng này');
        //     err.statusCode = 404
        //     return next(err)
        // }
      })
      .catch((err) => {
        res.status(404).json({ error: "Không tìm thấy thông tin người dùng" });
        // err = new Error('Không tìm thấy thông tin người dùng');
        // // err = new Error('Hệ thống đang xử lý, hãy chờ giây lát');
        // err.statusCode = 404
        // return next(err)
      });
  }

  //[PUT] /user/:id/editPassword
  editPassword(req, res, next) {
    //console.log(req.body)
    User.findById(req.user)
      .then((user) => {
        console.log("người dùng", user);
        if (bcrypt.compareSync(req.body.matKhau, user.matKhau)) {
          if (req.body.matKhauMoi === req.body.nhapLaiMatKhau) {
            const hashPassword = bcrypt.hashSync(req.body.matKhauMoi, 10);
            User.findByIdAndUpdate(req.user, { matKhau: hashPassword })
              .then((updateinfo) => res.status(200).json(updateinfo))
              .catch((err) => {
                res.status(500).json({ error: "Cập nhật thất bại" });
              });
          } else {
            res.status(500).json({ error: "Mật khẩu chưa đồng nhất" });
            // const err = new Error('Mật khẩu chưa đồng nhất');
            // err.statusCode = 500
            // return next(err)
          }
        } else {
          res.status(500).json({ error: "Mật khẩu chưa đúng" });
          // const err = new Error('Mật khẩu chưa đúng');
          // err.statusCode = 500
          // return next(err)
        }
      })
      .catch((err) => {
        res.status(500).json({ error: "Vui lòng thử lại" });
      });
  }
  getHistoryTicketById(req, res) {
    TicketBooking.findOne({ _id: req.params.IDticket })//
      .populate("maLichChieu")
      .populate("tentaiKhoan")
      .then((data) => {
        if (data) {
          res.status(200).json(data)
        }
        else res.status(404).json({ error: 'Không lấy được thông tin vé' })

      })
      .catch(err => res.status(500).json({ error: 'Đã xảy ra lỗi' }))
  }

  changeTicketBooking(req, res) {
    TicketBooking.findOne({ _id: req.params.IDTicket })
      .populate("maLichChieu")
      .then((data) => {
        if (data) {
          let showtimeID;
          const time = new Date(data.maLichChieu.ngayChieu);
          const now = new Date();
          const n = now.setHours(now.getHours() + 1);
          const minute = now.setMinutes(now.getMinutes() + 30);
          // console.log('hiện tại', now.getHours(), now.getMinutes())
          // console.log('hiện tại sau khi cộng 1 tiếng', now.toTimeString())
          //console.log('lịch chiếu', data.maLichChieu)
          if (time >= now) {
            showtimeID = data.maLichChieu._id;
            data.danhSachGheDoi = req.body.danhSachGheMoi
            data.daDoi = true;
            let listChair = [];
            let listNewChair = req.body.danhSachGheMoi
            data.danhSachVe.map((ghe) => {
              listChair.push(ghe.maGhe);
            });
            console.log("danh sach ghe", listChair);
            data
              .save()
              .then(() => {
                console.log("ID", showtimeID);
                Showtime.findOne({ _id: showtimeID })
                  .then(async (showtime) => {
                    if (showtime) {
                      await listChair.map((ghe) => {
                        const index = showtime.gheDaChon.indexOf(ghe);
                        if (index > -1) {
                          showtime.gheDaChon.splice(index, 1);
                        }
                      });
                      listNewChair.map((ghe) => {
                        showtime.gheDaChon.push(ghe)
                      })
                      showtime
                        .save()
                        .then(() => res.status(200).json("Đổi vé thành công"))
                        .catch((err) => res.status(400).json());
                    }
                  })
                  .catch((err) => res.status(400).json());
              })
              .catch((err) => res.status(400).json());
          } else
            res
              .status(400)
              .json({ error: "Không thể đổi vé gần sát giờ chiếu" });
        }
      });
  }


  cancelBooking(req, res) {
    TicketBooking.findOne({ _id: req.params.IDTicket })
      .populate("maLichChieu")
      .then((data) => {
        if (data) {
          let showtimeID;
          const time = new Date(data.maLichChieu.ngayChieu);
          const now = new Date();
          const n = now.setHours(now.getHours() + 1);
          const minute = now.setMinutes(now.getMinutes() + 30);
          // console.log('hiện tại', now.getHours(), now.getMinutes())
          // console.log('hiện tại sau khi cộng 1 tiếng', now.toTimeString())
          //console.log('lịch chiếu', data.maLichChieu)
          if (time >= now) {
            showtimeID = data.maLichChieu._id;
            data.daHuy = true;
            let listChair = [];
            data.danhSachVe.map((ghe) => {
              listChair.push(ghe.maGhe);
            });
            console.log("danh sach ghe", listChair);
            data
              .save()
              .then(() => {
                console.log("ID", showtimeID);
                Showtime.findOne({ _id: showtimeID })
                  .then((showtime) => {
                    if (showtime) {
                      listChair.map((ghe) => {
                        const index = showtime.gheDaChon.indexOf(ghe);
                        if (index > -1) {
                          showtime.gheDaChon.splice(index, 1);
                        }
                      });
                      showtime
                        .save()
                        .then(() => res.status(200).json("Hoàn vé thành công"))
                        .catch((err) => res.status(400).json());
                    }
                  })
                  .catch((err) => res.status(400).json());
              })
              .catch((err) => res.status(400).json());
          } else
            res
              .status(400)
              .json({ error: "Không thể hoàn vé gần sát giờ chiếu" });
        }
      });
  }
}
module.exports = new UserController();
