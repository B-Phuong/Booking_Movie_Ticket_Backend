const { check, validationResult } = require('express-validator');
exports.validationMovie = [
    check('tenPhim')
        .notEmpty()
        .withMessage('Bạn chưa nhập tên phim'),
    check('ngayKhoiChieu')
        .notEmpty()
        .withMessage('Nhập ngày chiếu của phim'),
    check('moTa')
        .notEmpty()
        .withMessage('Thiếu mô tả phim'),
    check('thoiLuong')
        .notEmpty()
        .withMessage('Chưa chọn thời lượng cho phim'),
    check('thoiLuong')
        .isFloat({ min: 0 })
        .withMessage('Thời lượng không được bé hơn 0'),
]
exports.validationShowTime = [

    check('tenCumRap')
        .notEmpty()
        .withMessage('Thiếu thông tin cụm rạp'),
    check('tenRap')
        .notEmpty()
        .withMessage('Thiếu tên rạp chiếu phim'),
    check('ngayChieu')
        .notEmpty()
        .withMessage('Vui lòng chọn ngày và khung giờ chiếu')

]

exports.validationUser = [
    check('taiKhoan')
        .notEmpty()
        .withMessage('Vui lòng nhập tên tài khoản'),
    check('matKhau')
        .notEmpty()
        .withMessage('Bạn chưa nhập mật khẩu'),
    check('email')
        .notEmpty()
        .withMessage('Vui lòng nhập gmail'),
    check('email')
        .isEmail()
        .withMessage('Vui lòng nhập đúng định dạng mail'),
    check('SDT')
        .isMobilePhone()
        .withMessage('Định dạng số điện thoại chưa phù hợp')

]

exports.validationChangePassword = [
    check('matKhau')
        .notEmpty()
        .withMessage('Bạn chưa nhập mật khẩu'),
    check('matKhauMoi')
        .notEmpty()
        .withMessage('Vui lòng nhập gmail'),
    check('nhapLaiMatKhau')
        .notEmpty()
        .withMessage('Vui lòng nhập gmail'),
]

exports.validationSignIn = [
    check('taiKhoan')
        .notEmpty()
        .withMessage('Vui lòng nhập tên tài khoản'),
    check('matKhau')
        .notEmpty()
        .withMessage('Bạn chưa nhập mật khẩu'),
]
exports.validationSignUp = [
    check('taiKhoan')
        .notEmpty()
        .withMessage('Vui lòng nhập tên tài khoản'),
    check('matKhau')
        .notEmpty()
        .withMessage('Bạn chưa nhập mật khẩu'),
    check('hoTen')
        .notEmpty()
        .withMessage('Bạn chưa điền họ tên'),
    check('email')
        .notEmpty()
        .withMessage('Vui lòng nhập gmail'),
    check('email')
        .isEmail()
        .withMessage('Vui lòng nhập đúng định dạng mail'),
    check('SDT')
        .notEmpty()
        .withMessage('Nhập số điện thoại'),
    check('SDT')
        .isMobilePhone()
        .withMessage('Định dạng số điện thoại chưa phù hợp'),
]

exports.validationFoodsAndDrinks = [
    check('tenCombo')
        .notEmpty()
        .withMessage('Vui lòng nhập tên của combo'),
    check('moTa')
        .notEmpty()
        .withMessage('Vui lòng ghi mô tả'),
    check('giaGoc')
        .notEmpty()
        .withMessage('Vui lòng nhập giá cho combo'),
    check('giaGoc')
        .isFloat({ min: 0 })
        .withMessage('Giá tiền không được bé hơn 0'),
    check('giamGia')
        .isFloat({ min: 0 })
        .withMessage('Phần tiềm giảm không được bé hơn 0'),
]
exports.isRequestValidated = (req, res, next) => {
    const errors = validationResult(req)
    if (errors.array().length > 0) {
        var err = []
        for (var i = 0; i < errors.array().length; i++) {
            err.push(' **')
            err.push(errors.array()[i].msg)
        }
        return res.status(400).json({ error: err })//errors.array()[0].msg })
    }
    next();
}