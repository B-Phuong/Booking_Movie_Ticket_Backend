
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

class Auth {
    // với re là reqiure và res là response
    checkPermission(req, res, next) { //dùng try catch để bắt lỗi khi chưa đăng nhập/ chưa tìm thấy token (do checkPermission là xử lý đồng bộ)
        try {
            if (req.headers.authorization) {
                // console.log('1')
                const token = req.headers.authorization.split(" ")[1];
                const user = jwt.verify(token, 'user'); //_id, maLoaiNguoiDung
                console.log('người dùng khi đăng nhập', user)
                req.data = user;
                next()
            }
            else {
                return res.status(500).json({ error: 'Vui lòng thực hiện đăng nhập' })
                //     const err = new Error('Vui lòng thực hiện đăng nhập');
                //     err.statusCode = 404
                //     return next(err)
            }

        } catch (err) { res.status(500).json({ error: 'Vui lòng thực hiện đăng nhập' }) };


    }
    checkAdmin(req, res, next) {
        if (req.data.maLoaiNguoiDung == '0')

            next();
        else {
            res.status(404).json({ error: 'Không có quyền truy cập chức năng này' })
            // const err = new Error('Không có quyền truy cập chức năng này');
            // err.statusCode = 404
            // return next(err)
        }
    }
    checkUser(req, res, next) {
        if (req.data.maLoaiNguoiDung == '1') {
            req.user = req.data._id
            next();
        }
        else {
            res.status(404).json({ error: 'Không có quyền truy cập chức năng này' })
            // const err = new Error('Không có quyền truy cập chức năng này');
            // err.statusCode = 404
            // return next(err)
        }
    }


}
module.exports = new Auth;