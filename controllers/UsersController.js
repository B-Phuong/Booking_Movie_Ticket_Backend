const User = require("../models/User");
const TicketBooking = require("../models/TicketBooking");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Showtime = require("../models/Showtime");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
class UsersController {
  // với re là require và res là response

  //[GET] /user/info/:id
  info(req, res) {
    User.find({ _id: req.user })
      .then((data) => {
        res.status(200).json({ data });
      })
      .catch((err) => {
        res
          .status(404)
          .json({ error: "Không tìm thấy thông tin người dùng này" });
      });
  }

  //[PUT] user/:id
  async edit(req, res) {
    const userInfo = await User.findOne({ _id: req.user });
    const userUpdate = {
      ...userInfo._doc,
      ...req.body,
    };
    if (req.body.SDT && req.body.hoTen && req.body.email) {
      // console.log(">> req.file.path", req.file)
      if (req.file != undefined) {
        try {
          const fileStr = req.file.path;
          const uploadResponse = await cloudinary.uploader.upload(fileStr, {
            folder: "BookingTicket",
            use_filename: true,
          });
          userUpdate.anhDaiDien = uploadResponse.url;
          userUpdate.maHinhAnh = uploadResponse.public_id;
          userInfo.maHinhAnh
            ? cloudinary.uploader.destroy(userInfo.maHinhAnh, {
              type: "upload",
            })
            : "";
        } catch (err) {
          return res.status(500).json({ error: "Cập nhật thất bại" });
        }
      }
      User.findByIdAndUpdate(req.user, userUpdate)
        .then(() => {
          res.status(200).json({
            message: "Bạn đã chỉnh sửa được thông tin!",
            data: userUpdate,
          });
        })
        .catch((err) => {
          res.status(400).json({ error: "Bạn chỉnh sửa thông tin thất bại!" });
        });
    } else {
      res.status(400).json({ error: "Bạn vẫn còn thiếu thông tin" });
    }
  }
  //[GET] user/logOut
  logOut(req, res) {
    if (localStorage.getItem("token")) {
      //if (req.cookies.token)
      localStorage.setItem("token", "");
    } else res.json({ error: "Bạn chưa đăng nhập!" });
  }
  //[GET] user/search
  find(req, res) {
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
          res.status(404).json({ error: "Không tìm thấy người dùng" });
        } else {
          res.status(200).json({ data });
        }
      })
      .catch((err) => {
        res.status(404).json({ error: "Không tìm thấy người dùng" });
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
        if (data) res.status(200).json({ data });
        else {
          res.status(404).json({ error: "Vui lòng thử lại" });
        }
      })
      .catch((err) => {
        res.status(500).json({ error: "Vui lòng thử lại" });
      });
  }

  //[GET] /admin/user
  getAllUser(req, res) {
    User.find({ maLoaiNguoiDung: "1" })
      .then((data) => {
        res.status(200).json({ data });
      })
      .catch((err) => {
        res.status(404).json({ error: "Không tìm thấy thông tin người dùng" });
      });
  }

  //[PUT] /user/:id/editPassword
  editPassword(req, res) {
    //console.log(req.body)
    User.findById(req.user)
      .then((user) => {
        console.log("người dùng", user);
        if (bcrypt.compareSync(req.body.matKhau, user.matKhau)) {
          if (req.body.matKhauMoi === req.body.nhapLaiMatKhau) {
            const hashPassword = bcrypt.hashSync(req.body.matKhauMoi, 10);
            User.findByIdAndUpdate(req.user, { matKhau: hashPassword })
              .then((updateinfo) =>
                res.status(200).json({
                  message: "Cập nhật thông tin thành công",
                  data: updateinfo,
                })
              )
              .catch((err) => {
                res.status(500).json({ error: "Cập nhật thất bại" });
              });
          } else {
            res.status(500).json({ error: "Mật khẩu chưa đồng nhất" });
          }
        } else {
          res.status(500).json({ error: "Mật khẩu chưa đúng" });
        }
      })
      .catch((err) => {
        res.status(500).json({ error: "Vui lòng thử lại" });
      });
  }
  getHistoryTicketById(req, res) {
    TicketBooking.findOne({ _id: req.params.IDticket }) //
      .populate("maLichChieu")
      .populate("tentaiKhoan")
      .then((data) => {
        if (data) {
          res.status(200).json(data);
        } else res.status(404).json({ error: "Không lấy được thông tin vé" });
      })
      .catch((err) => res.status(500).json({ error: "Đã xảy ra lỗi" }));
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
            data.danhSachGheDoi = req.body.danhSachGheMoi;
            data.daDoi = true;
            let listChair = [];
            let listNewChair = req.body.danhSachGheMoi;
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
                        showtime.gheDaChon.push(ghe);
                      });
                      showtime
                        .save()
                        .then(() =>
                          res.status(200).json({
                            message: "Đổi vé thành công",
                            data: showtime,
                          })
                        )
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
                        .then(() =>
                          res.status(200).json({
                            message: "Hoàn vé thành công",
                            data: showtime,
                          })
                        )
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
module.exports = new UsersController();
