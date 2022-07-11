const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AccountController {
    //[POST] /user/signins

    signIn(req, res, next) {
        const form = req.body;
        User.findOne({ tentaiKhoan: form.taiKhoan })
            //.select('-matKhau')
            .then(data => {
                if (bcrypt.compareSync(form.matKhau, data.matKhau)) {
                    var token = jwt.sign({ _id: data._id, maLoaiNguoiDung: data.maLoaiNguoiDung }, 'user', { expiresIn: '1h' });
                    // data = {
                    //     ...data,
                    //     token: token
                    // }
                    res.cookie('token', token);
                    return res.status(200).json({
                        data: {
                            maLoaiNguoiDung: data.maLoaiNguoiDung,
                            tentaiKhoan: data.tentaiKhoan
                        },
                        token: token,
                        expiresIn: 3600 //đơn vị là giây
                    });
                }
                else {
                    res.status(404).json({ error: 'Tên tài khoản hoặc mật khẩu chưa hợp lệ' })
                    // const err = new Error('Tên tài khoản hoặc mật khẩu chưa hợp lệ');
                    // err.statusCode = 404
                    // return next(err)
                }
            })
            .catch(err => {
                res.status(404).json({ error: 'Tài khoản chưa được đăng ký' })
                // err = new Error('Tài khoản chưa được đăng ký');
                // err.statusCode = 404
                // return next(err)
            })

    }

    // //POST] /user/signUp

    signUp(req, res, next) {
        const formDta = req.body;
        const hashPassword = bcrypt.hashSync(req.body.matKhau, 10);

        //const user = new User(formDta);
        const user = new User({
            tentaiKhoan: formDta.taiKhoan,
            hoTen: formDta.hoTen,
            matKhau: hashPassword,
            email: formDta.email,
            SDT: formDta.SDT,
        })
        User.find({ tentaiKhoan: user.tentaiKhoan })
            .then((data) => {
                if (data.length > 0)
                    res.status(400).json({ error: "Tên tài khoản đã có người sử dụng" })
                else {
                    user.save()
                        .then(() => res.status(200).json('Đăng ký thành công'))
                        .catch(err => {
                            res.status(500).json({ error: 'Đăng ký thất bại, vui lòng thử lại!' })
                            // err.statusCode = 400
                            // return next(err)
                        });
                }
            })
            .catch(err => res.status(500).json({ error: 'Đăng ký thất bại, vui lòng thử lại' }))



        // User.findOne({ tentaiKhoan: req.body.taiKhoan })
        //     .then(data => {
        //         if (data) {
        //             const err = new Error('Tên tài khoản đã được sử dụng, vui lòng chọn tên khác');
        //             err.statusCode = 404
        //             return next(err)
        //         }
        //         else {
        //             const formDta = req.body;
        //             const hashPassword = bcrypt.hashSync(req.body.matKhau, 10);

        //             //const user = new User(formDta);
        //             const user = new User({
        //                 tentaiKhoan: formDta.taiKhoan,
        //                 hoTen: '',
        //                 matKhau: hashPassword,
        //                 email: formDta.email,
        //                 SDT: formDta.soDt,
        //                 maLoaiNguoiDung: "1"
        //             })
        //             user.save()
        //                 .then(() => res.status(200).json('Đăng ký thành công'))
        //                 .catch(err => {
        //                     err.statusCode = 400
        //                     return next(err)

        //                 });

        //         }
        //     })
        //     .catch(err => {
        //         err = new Error('Hệ thống đang xử lý, vui lòng chờ');
        //         err.statusCode = 500
        //         return next(err)
        //     })

    }

}
module.exports = new AccountController;