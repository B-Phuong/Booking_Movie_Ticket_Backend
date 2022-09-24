
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')

class Auth {
    // với re là reqiure và res là response
    checkPermission(req, res, next) { //dùng try catch để bắt lỗi khi chưa đăng nhập/ chưa tìm thấy token (do checkPermission là xử lý đồng bộ)
        try {
            if (req.headers.authorization) {
                console.log('---------------------------------------------------------------')
                const token = req.headers.authorization.split(" ")[1];
                const user = jwt.verify(token, 'user'); //_id, maLoaiNguoiDung
                console.log(`>>request ${req.body.soThuTu} nhận lúc`, new Date())
                console.log('người dùng khi đăng nhập', user)
                req.data = user;
                next()
            }
            else {
                return res.status(401).json({ error: 'Vui lòng thực hiện đăng nhập' })
            }

        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Lỗi hệ thống' });
        }
    }
    checkAdmin(req, res, next) {
        if (req.data.maLoaiNguoiDung == '0')

            next();
        else {
            res.status(403).json({ error: 'Không có quyền truy cập chức năng này' })
        }
    }
    checkUser(req, res, next) {
        console.log('Thời gian nhận request', new Date())
        if (req.data.maLoaiNguoiDung == '1') {
            req.user = req.data._id
            next();
        }
        else {
            res.status(403).json({ error: 'Không có quyền truy cập chức năng này' })
        }
    }
}
module.exports = new Auth;