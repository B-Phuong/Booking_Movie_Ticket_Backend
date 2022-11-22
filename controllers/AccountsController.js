const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class AccountsController {
  //[POST] /user/signins

  signIn(req, res) {
    const form = req.body;
    User.findOne({ tentaiKhoan: form.taiKhoan })
      //.select('-matKhau')
      .then((data) => {
        if (bcrypt.compareSync(form.matKhau, data.matKhau)) {
          var token = jwt.sign(
            { _id: data._id, maLoaiNguoiDung: data.maLoaiNguoiDung },
            "user",
            { expiresIn: "1h" }
          );
          res.cookie("token", token);
          return res.status(200).json({
            data: {
              maLoaiNguoiDung: data.maLoaiNguoiDung,
              tentaiKhoan: data.tentaiKhoan,
            },
            token: token,
            expiresIn: 3600, //đơn vị là giây
          });
        } else {
          res
            .status(404)
            .json({ error: "Tên tài khoản hoặc mật khẩu chưa hợp lệ" });
        }
      })
      .catch((err) => {
        res.status(404).json({ error: "Tài khoản chưa được đăng ký" });
      });
  }

  // //POST] /user/signUp

  signUp(req, res) {
    const formDta = req.body;
    const hashPassword = bcrypt.hashSync(req.body.matKhau, 10);

    //const user = new User(formDta);
    const user = new User({
      tentaiKhoan: formDta.taiKhoan,
      hoTen: formDta.hoTen,
      matKhau: hashPassword,
      email: formDta.email,
      SDT: formDta.SDT,
    });
    User.find({ tentaiKhoan: user.tentaiKhoan })
      .then((data) => {
        if (data.length > 0)
          res.status(400).json({ error: "Tên tài khoản đã có người sử dụng" });
        else {
          user
            .save()
            .then(() => res.status(201).json("Đăng ký thành công"))
            .catch((err) => {
              res
                .status(500)
                .json({ error: "Đăng ký thất bại, vui lòng thử lại!" });
            });
        }
      })
      .catch((err) =>
        res.status(500).json({ error: "Đăng ký thất bại, vui lòng thử lại" })
      );
  }
}
module.exports = new AccountsController();
