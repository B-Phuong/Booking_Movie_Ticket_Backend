require("dotenv").config();
const Movie = require("../models/Movie");
const TicketBooking = require("../models/TicketBooking");
const { removeVietnameseTones } = require("../helper/formatString");
const Comment = require("../models/Comment");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
class MoviesController {
  //[GET] /movie/:bidanh
  showDetail(req, res) {
    // setTimeout(() => {
    //   return res.status(500).json({ error: "Yêu cầu tốn quá nhiều thời gian" })
    // }, 500)
    Movie.find({ biDanh: req.params.biDanh })
      .populate("lichChieu")
      .populate({
        path: "lichChieu",
        populate: { path: "tenCumRap" },
      })
      .populate({
        path: "lichChieu",
        populate: { path: "tenRap", select: "_id tenRap" },
      })
      .populate("nguoiDanhGia", "tentaiKhoan")
      .populate("binhLuan")
      .populate({
        path: "binhLuan",
        populate: { path: "maNguoiBinhLuan" },
      })
      .sort({ createdAt: 1 })
      .then((data) => {
        // console.log(data);
        if (data.length != 0) res.status(200).json({ data });
        else {
          return res
            .status(404)
            .json({ error: "Không tìm thấy thông tin phim" });
        } //res.status(404).json('Không tìm thấy thông tin phim')
      })
      .catch((err) => {
        return res.status(500).json({ error: "Không tìm thấy thông tin phim" });
      });
  }
  //[GET]
  show(req, res) {
    Movie.find({ daXoa: false })
      .then((data) => {
        // console.log(data);
        if (data.length != 0) {
          const movieShowing = [];
          data.forEach((movie) => {
            // const formatDate = new Date(movie.ngayKhoiChieu)
            const dateNow = new Date();
            // // console.log(formatDate.getDate(), formatDate.getMonth() + 3, dateNow.getMonth() + 1, dateNow.getDate())
            // if (formatDate.getMonth() + 2 >= dateNow.getMonth() && formatDate.getDate() >= dateNow.getDate())
            if (movie.ngayKetThuc > dateNow && movie.ngayKhoiChieu < dateNow)
              movieShowing.push(movie);
          });
          res.status(200).json({ data: movieShowing });
        } else {
          res.status(404).json({ error: "Chưa có phim nào" });
        }
      })
      .catch((err) => {
        res.status(500).json({ error: "Hệ thống đang xử lý, vui lòng chờ" });
      });
  }
  //[GET]
  showMovieComing(req, res) {
    Movie.find({ daXoa: false })
      .then((data) => {
        // console.log(data);
        if (data.length != 0) {
          const movieComing = [];
          data.forEach((movie) => {
            const formatDate = new Date(movie.ngayKhoiChieu);
            if (formatDate > Date.now()) movieComing.push(movie);
          });
          res.status(200).json({ data: movieComing });
        } else {
          res.status(404).json({ error: "Chưa có phim nào" });
          // const err = new Error('Chưa có phim nào');
          // err.statusCode = 404
          // return next(err)
        }
      })
      .catch((err) => {
        res.status(500).json({ error: "Hệ thống đang xử lý, vui lòng chờ" });
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
          var movies = [];
          var countDuplicate = 0;
          var formattedDate = (dateInput) => {
            let today = new Date(dateInput);
            const yyyy = today.getFullYear();
            let mm = today.getMonth() + 1;
            let dd = today.getDate();

            if (dd < 10) dd = "0" + dd;
            if (mm < 10) mm = "0" + mm;

            return yyyy + "-" + mm + "-" + dd;
          };
          let st = [];
          let biDAnhLs = [];
          data.forEach((showtime) => {
            countDuplicate = 0;
            if (showtime.lichChieu.length > 0) {
              biDAnhLs.push({ name: showtime.biDanh, lich: [] });
              showtime.lichChieu.forEach((cumRap) => {
                const date = formattedDate(new Date(cumRap.ngayChieu));
                const filterDate = formattedDate(new Date(req.body.ngayDaChon));
                if (
                  cumRap.tenCumRap === req.params.maCumRap &&
                  date == filterDate
                ) {
                  countDuplicate++;
                  st.push({ name: showtime.biDanh, lich: cumRap });
                  // res.status(200).json({ data: movies });
                }
              });
            }
            // console.log("------", biDAnhLs);
            biDAnhLs.map((biDanh, i) => {
              st.map((n) => {
                if (biDanh.name === n.name) {
                  if (!biDanh.lich.includes(n.lich)) {
                    biDanh.lich.push(n.lich);
                  }
                }
              });
            });

            if (countDuplicate > 0) {
              biDAnhLs.map((n) => {
                if (showtime.biDanh === n.name) {
                  movies.push({
                    tenPhim: showtime.tenPhim,
                    theLoai: showtime.theLoai,
                    moTa: showtime.moTa,
                    trailer: showtime.trailer,
                    thoiLuong: showtime.thoiLuong,
                    hinhAnh: showtime.hinhAnh,
                    biDanh: showtime.biDanh,
                    lichChieu: n.lich,
                  });
                }
              });
            }
          });
          // console.log('dữ liệu của phim', phim)
          res.status(200).json({ data: movies });
          // res.status(404).json(phim);
        } else {
          res.status(404).json({ error: "Chưa có phim nào" });
        }
      })
      .catch((err) => {
        res.status(500).json({ error: "Hệ thống đang xử lý, vui lòng chờ" });
      });
  }
  //[PUT] /movie/:bidanh
  async edit(req, res) {
    const movie = await Movie.findOne({ biDanh: req.params.bidanh });
    const movieUpdate = {
      ...movie._doc,
      ...req.body,
      theLoai: req.body.theLoai.split(","),
      ngayKhoiChieu: new Date(req.body.ngayKhoiChieu),
      thoiLuong: Number(req.body.thoiLuong),
    };
    if (req.files.hinhAnh != undefined) {
      try {
        const image = req.files.hinhAnh[0].path;
        const uploadImageResponse = await cloudinary.uploader.upload(image, {
          folder: "BookingTicket/Images",
          use_filename: true,
        });
        movieUpdate.hinhAnh = uploadImageResponse.url;
        movieUpdate.maHinhAnh = uploadImageResponse.public_id;
        cloudinary.uploader.destroy(movie.maHinhAnh, { type: "upload" });
      } catch (err) {
        res.status(500).json({ error: "Cập nhật thất bại" });
      }
    }
    if (req.files.anhBia != undefined) {
      try {
        const banner = req.files.anhBia[0].path;
        const uploadBannerResponse = await cloudinary.uploader.upload(banner, {
          folder: "BookingTicket/Banners",
          use_filename: true,
        });
        movieUpdate.anhBia = uploadBannerResponse.url;
        movieUpdate.maAnhBia = uploadBannerResponse.public_id;
        cloudinary.uploader.destroy(movie.maAnhBia, { type: "upload" });
        // console.log(">> done upload", movieUpdate);
      } catch (err) {
        res.status(500).json({ error: "Cập nhật thất bại" });
      }
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
              res.status(200).json({ message: "Xóa thành công", data });
            })
            .catch((err) => {
              res
                .status(500)
                .json({ message: "Hệ thống đang xử lý, vui lòng chờ" });
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
      anhBia: "",
      theLoai: req.body.theLoai.split(","),
      quocGia: req.body.quocGia,
    });
    const ngayKhoiChieu = new Date(req.body.ngayKhoiChieu);
    // console.log(">>>>ngayKhoiChieu", ngayKhoiChieu);
    movie.ngayKetThuc = ngayKhoiChieu.setMonth(ngayKhoiChieu.getMonth() + 2);
    //console.log(">>>>ngayKetThuc", movie.ngayKetThuc);
    Movie.find({ tenPhim: movie.tenPhim.toUpperCase() })
      .then(async (data) => {
        if (data.length > 0)
          res.status(400).json({ error: "Tên phim đã được sử dụng" });
        else {
          let slug = removeVietnameseTones(movie.tenPhim);
          slug = slug.split(" ").join("-").toLowerCase();
          let allMoviesBySlug = await Movie.find({
            biDanh: {
              $regex: RegExp(slug, "i"),
            },
          }).sort({ createdAt: 1 });
          if (allMoviesBySlug.length > 0) {
            const splitSlugOfLast =
              allMoviesBySlug[allMoviesBySlug.length - 1].biDanh.split("-");
            let currentNumber = Number(
              splitSlugOfLast[splitSlugOfLast.length - 1]
            );
            if (currentNumber) {
              currentNumber++;
            } else {
              currentNumber = 1;
            }
            slug += `-${currentNumber}`;
          }
          movie.biDanh = slug;
          // Upload image to cloudinary
          //console.log(">>", req.files);
          try {
            const image = req.files.hinhAnh[0].path;
            const banner = req.files.anhBia[0].path;
            const uploadImageResponse = await cloudinary.uploader.upload(
              image,
              { folder: "BookingTicket/Images", use_filename: true }
            );
            movie.hinhAnh = uploadImageResponse.url;
            movie.maHinhAnh = uploadImageResponse.public_id;
            const uploadBannerResponse = await cloudinary.uploader.upload(
              banner,
              { folder: "BookingTicket/Banners", use_filename: true }
            );
            movie.anhBia = uploadBannerResponse.url;
            movie.maAnhBia = uploadBannerResponse.public_id;
            await movie.save();
            res
              .status(201)
              .json({ message: "Thêm phim thành công", data: movie });
          } catch (err) {
            res.status(500).json({ error: "Thêm phim thất bại" });
          }
        }
      })
      .catch(() => { });
  }
  //[GET] topMoives
  top10Movies(req, res) {
    Movie.find({ soLuongBan: { $gt: 0 } })
      .sort({ soLuongBan: -1 })
      .limit(10)
      .then((data) => {
        // console.log(">> data top movies", data);
        return res.status(200).json({
          data,
        });
      })
      .catch((err) => {
        // console.log(">> in catch");
        return res.status(500).json({ error: "Hệ thống đang xử lý" });
      });
  }
  //[GET] topShowtimes
  //LẤY THỜI GIAN KHÁCH chọn CHIẾU -> lưu 1 mảng để thống kê số lần mua -> xếp hạng (CHƯA LÀM ĐƯỢC)
  async top20Showtimes(req, res) {
    const ticket = await TicketBooking.find({}).populate("maLichChieu");
    res.json(ticket);
    ticket.find({ "maLichChieu.ngayChieu": { $gt: "maLichChieu.ngayChieu" } });
  }

  async rating(req, res) {
    const biDanh = req.params.bidanh;
    const { danhGia } = req.body;
    const nguoiDanhGia = req.user;
    const movie = await Movie.findOne({ biDanh: biDanh });
    if (movie.nguoiDanhGia == undefined) movie.nguoiDanhGia = [];
    if (movie.danhGia == undefined) movie.danhGia = 0;
    let isRated = movie.nguoiDanhGia.find((item) => item == nguoiDanhGia);
    if (isRated) {
      return res.status(400).json({ error: "Người dùng đã đánh giá rồi" });
    }
    let listUsers = movie.nguoiDanhGia;
    movie.nguoiDanhGia = [...listUsers, nguoiDanhGia];
    let count = movie.nguoiDanhGia.length;
    let rating = ((movie.danhGia + Number(danhGia)) / count).toFixed(2);
    //console.log(">> fix star", rating);
    movie.danhGia = Number(rating);
    let isSaved = await movie.save();
    if (isSaved) {
      return res.status(200).json({ data: movie });
    }
    return res.status(400).json({ error: "Vui lòng thử lại" });
  }

  async comment(req, res) {
    const biDanh = req.params.bidanh;
    const { noiDung } = req.body;
    const nguoiBinhLuan = req.user;
    let comment = new Comment({});
    comment.noiDung = noiDung;
    comment.maNguoiBinhLuan = nguoiBinhLuan;
    var idComment = comment._id;
    // console.log(">> comment", comment);
    let isCommentSaved = await comment.save();
    // console.log(">> isCommentSaved", isCommentSaved);
    if (isCommentSaved) {
      const movie = await Movie.findOne({ biDanh: biDanh });
      let comments = movie.binhLuan;
      movie.binhLuan = [...comments, idComment];
      // console.log(">> if");
      let isSaved = await movie.save();
      if (isSaved) {
        return res.status(200).json({ data: movie });
      } else {
        const delComment = await Comment.findByIdAndDelete(idComment);
        return res.status(400).json({ error: "Vui lòng thử lại x" });
      }
    } else return res.status(400).json({ error: "Vui lòng thử lại" });
  }
}
module.exports = new MoviesController();
