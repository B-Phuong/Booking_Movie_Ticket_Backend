require('dotenv').config();
const Movie = require("../models/Movie");
const TicketBooking = require("../models/TicketBooking");
const { removeVietnameseTones } = require("../helper/formatString");
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
class MoviesController {
  //[GET] /movie/:bidanh
  showDetail(req, res) {
    Movie.find({ biDanh: req.params.biDanh })
      .populate("lichChieu")
      .populate({
        path: "lichChieu",
        populate: { path: "tenCumRap" },
      })
      .populate({
        path: "lichChieu",
        populate: { path: "tenRap" },
      })
      .then((data) => {
        //console.log(data)
        if (data.length != 0) res.status(200).json({ data });
        else {
          res.status(404).json("Không tìm thấy thông tin phim");
        } //res.status(404).json('Không tìm thấy thông tin phim')
      })
      .catch((err) => {
        res.status(500).json("Không tìm thấy thông tin phim");
      });
  }
  //[GET]
  show(req, res) {
    Movie.find({ daXoa: false })
      .then((data) => {
        // console.log(data);
        if (data.length != 0) {
          const movieShowing = []
          data.forEach((movie) => {
            // const formatDate = new Date(movie.ngayKhoiChieu)
            const dateNow = new Date()
            // // console.log(formatDate.getDate(), formatDate.getMonth() + 3, dateNow.getMonth() + 1, dateNow.getDate())
            // if (formatDate.getMonth() + 2 >= dateNow.getMonth() && formatDate.getDate() >= dateNow.getDate())
            if (movie.ngayKetThuc > dateNow && movie.ngayKhoiChieu < dateNow)
              movieShowing.push(movie)
          })
          res.status(200).json({ data: movieShowing });
        }
        else {
          res.status(404).json("Chưa có phim nào");
        }
      })
      .catch((err) => {
        res.status(500).json("Hệ thống đang xử lý, vui lòng chờ");
      });
  }
  //[GET]
  showMovieComing(req, res) {
    Movie.find({ daXoa: false })
      .then((data) => {
        // console.log(data);
        if (data.length != 0) {
          const movieComing = []
          data.forEach((movie) => {
            const formatDate = new Date(movie.ngayKhoiChieu)
            if (formatDate > Date.now())
              movieComing.push(movie)
          })
          res.status(200).json({ data: movieComing });
        }
        else {
          res.status(404).json("Chưa có phim nào");
          // const err = new Error('Chưa có phim nào');
          // err.statusCode = 404
          // return next(err)
        }
      })
      .catch((err) => {
        res.status(500).json("Hệ thống đang xử lý, vui lòng chờ");
        // err = new Error('Hệ thống đang xử lý, vui lòng chờ');
        // err.statusCode = 500
        // return next(err)
      });
  }

  showMovieByCluster(req, res) {
    Movie.find({ daXoa: false })
      .populate("lichChieu")
      .then((data) => {
        if (data.length != 0) {
          var movies = []
          var countDuplicate = 0
          data.forEach((showtime) => {
            countDuplicate = 0
            showtime.lichChieu.forEach((cumRap) => {
              //res.status(404).json(cumRap);
              const date = new Date(cumRap.ngayChieu)
              if (cumRap.tenCumRap === req.params.maCumRap && date > Date.now()) {
                countDuplicate++
                //   console.log('biến đếm', countDuplicate)
              }
            })
            if (countDuplicate > 0) movies.push(showtime)
          }
          )
          // console.log('dữ liệu của phim', phim)
          res.status(200).json({ data: movies });
          // res.status(404).json(phim);
        } else {
          res.status(404).json("Chưa có phim nào");
        }
      })
      .catch((err) => {
        res.status(500).json("Hệ thống đang xử lý, vui lòng chờ");
      });
  }
  //[PUT] /movie/:bidanh
  async edit(req, res) {
    const movie = await Movie.findOne({ biDanh: req.params.bidanh })
    const movieUpdate = {
      ...movie._doc,
      ...req.body,
      ngayKhoiChieu: new Date(req.body.ngayKhoiChieu),
      thoiLuong: Number(req.body.thoiLuong),
    };
    try {
      const fileStr = req.file.path;
      const uploadResponse = await cloudinary.uploader.upload(fileStr, { folder: "BookingTicket", use_filename: true });
      console.log(uploadResponse)
      movieUpdate.hinhAnh = uploadResponse.url;
      movieUpdate.maHinhAnh = uploadResponse.public_id;
      cloudinary.uploader.destroy(movie.maHinhAnh, { type: "upload" });
    } catch (err) {
      res.status(500).json({ error: 'Cập nhật thất bại' });
    }
    Movie.findOneAndUpdate({ biDanh: req.params.bidanh }, movieUpdate)
      .then((data) => {
        if (data) {
          res.status(200).json({ message: "Cập nhật thành công", data });
        } else {
          res.status(404).json({ error: "Cập nhật thất bại" });
        }
      })
      .catch((err) => {
        res.status(500).json({ error: "Hệ thống đang xử lý, vui lòng chờ" });
      });
  }

  //[DELETE] /movie/:bidanh
  delete(req, res) {
    Movie.find({ biDanh: req.params.bidanh })
      .populate("lichChieu")
      .then((movie) => {
        //console.log("phim", movie[0].lichChieu);
        var count = 0;
        movie[0].lichChieu.map((lichchieu) => {
          // console.log('lịch chiếu', lichchieu)
          const ngaychieu = new Date(lichchieu.ngayChieu);
          if (ngaychieu > Date.now()) {
            count++;
          }
        });
        //console.log("Kiểm tra lịch chiếu chưa thỏa:", count);
        if (count == 0) {
          Movie.findOneAndUpdate({ biDanh: req.params.bidanh }, { daXoa: true })
            .then((data) => {
              res.status(200).json({ message: "Xóa thành công", data })
            })
            .catch((err) => {
              res.status(500).json({ message: "Hệ thống đang xử lý, vui lòng chờ" });
            });
        } else res.status(400).json({ message: "Xóa không thành công" });
      });
  }
  //[POST] /movie
  add(req, res) {
    const movie = new Movie({
      tenPhim: req.body.tenPhim,
      hinhAnh: "",
      moTa: req.body.moTa,
      trailer: req.body.trailer,
      ngayKhoiChieu: new Date(req.body.ngayKhoiChieu),
      thoiLuong: Number(req.body.thoiLuong),
    });
    const ngayKhoiChieu = new Date(req.body.ngayKhoiChieu);
    console.log(">>>>ngayKhoiChieu", ngayKhoiChieu)
    movie.ngayKetThuc = ngayKhoiChieu.setMonth(ngayKhoiChieu.getMonth() + 2)
    console.log(">>>>ngayKetThuc", movie.ngayKetThuc)
    Movie.find({ tenPhim: movie.tenPhim.toUpperCase() })
      .then(async (data) => {
        if (data.length > 0)
          res.status(400).json({ error: "Tên phim đã được sử dụng" })
        else {
          let slug = removeVietnameseTones(movie.tenPhim)
          slug = slug.split(" ").join("-").toLowerCase();
          let allMoviesBySlug = await Movie.find({
            "biDanh": {
              "$regex": RegExp(slug, 'i')
            },
          }).sort({ 'createdAt': 1 });
          if (allMoviesBySlug.length > 0) {
            const splitSlugOfLast = allMoviesBySlug[allMoviesBySlug.length - 1].biDanh.split('-')
            let currentNumber = Number(splitSlugOfLast[splitSlugOfLast.length - 1])
            if (currentNumber) {
              currentNumber++;
            } else {
              currentNumber = 1;
            }
            slug += `-${currentNumber}`
          }
          movie.biDanh = slug;
          // Upload image to cloudinary
          try {
            const fileStr = req.file.path;
            const uploadResponse = await cloudinary.uploader.upload(fileStr, { folder: "BookingTicket", use_filename: true });
            movie.hinhAnh = uploadResponse.url;
            movie.maHinhAnh = uploadResponse.public_id;
            await movie.save()
            res.status(201).json({ message: 'Thêm phim thành công', data: movie })
          } catch (err) {
            res.status(500).json({ error: 'Thêm phim thất bại' });
          }
        }
      })
      .catch(() => {
      })
  }
  //[GET] topMoives
  top10Movies(res) {
    Movie.find({ soLuongBan: { $gt: 0 } })
      .sort({ soLuongBan: -1 })
      .limit(10)
      .then((data) => {
        if (data.length > 0)
          res
            .status(200)
            .json({
              data
            });
        else
          res
            .status(404)
            .json({
              message: "Top 10 phim được xem nhiều của rạp"
            });
      })
      .catch((err) => {
        res.status(500).json({ error: "Hệ thống đang xử lý" });
      });
  }
  //[GET] topShowtimes
  //LẤY THỜI GIAN KHÁCH chọn CHIẾU -> lưu 1 mảng để thống kê số lần mua -> xếp hạng (CHƯA LÀM ĐƯỢC)
  async top20Showtimes(res) {
    const ticket = await TicketBooking.find({}).populate("maLichChieu");
    res.json(ticket);
    ticket.find({ "maLichChieu.ngayChieu": { $gt: "maLichChieu.ngayChieu" } });
  }
}
module.exports = new MoviesController();