const express = require("express");
const router = express.Router();
const movieController = require("../controllers/MovieController");
const showtimeController = require("../controllers/ShowtimeController");
const accountController = require("../controllers/AccountController");
const userController = require("../controllers/userController");
const {
  validationMovie,
  validationUser,
  isRequestValidated,
  validationShowTime,
} = require("../middleware/Values");
const Auth = require("../middleware/Auth");
const multer = require("multer");
//const shortid = require("shortid");
const path = require("path");
const ShowtimeController = require("../controllers/ShowtimeController");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = require("../services/multer");


// const upload = multer({ storage: storage }).single('file');

// Cloudinary
// Require the cloudinary library
// const cloudinary = require('cloudinary');

// // Return "https" URLs by setting secure: true
// cloudinary.config({
//   secure: true
// });

require('dotenv').config();
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//Movie

router.post(
  "/movie/:bidanh/showtime",
  Auth.checkPermission,
  Auth.checkAdmin,
  validationShowTime,
  isRequestValidated,
  showtimeController.add
);
router.get(
  "/movie/topShowtimes",
  Auth.checkPermission,
  Auth.checkAdmin,
  movieController.top20Showtimes
);
router.get(
  "/movie/topMovies",
  Auth.checkPermission,
  Auth.checkAdmin,
  movieController.top10Movies
);
router.get(
  "/movie/movietheater",
  /*Auth.checkPermission, Auth.checkAdmin,*/ ShowtimeController.getMovieTheater
);
router.get(
  "/movie/room",
  /*Auth.checkPermission, Auth.checkAdmin,*/ ShowtimeController.getRoom
);
router.delete(
  "/movie/:bidanh",
  Auth.checkPermission,
  Auth.checkAdmin,
  movieController.delete
);
router.put(
  "/movie/:bidanh",
  Auth.checkPermission,
  Auth.checkAdmin,
  upload.single("hinhAnh"),
  // validationMovie,
  // isRequestValidated,
  movieController.edit,
);
router.post(
  "/movie",
  Auth.checkPermission,
  Auth.checkAdmin,
  upload.single("hinhAnh"),
  validationMovie,
  isRequestValidated,
  movieController.add
);
//User
router.get(
  "/user/search",
  Auth.checkPermission,
  Auth.checkAdmin,
  userController.find
);
// router.delete(
//   "/delete",
//   Auth.checkPermission,
//   // Auth.checkAdmin,
//   async (req, res) => {
//     console.log(req.body.public_id)
//     try {
//       // Delete image from cloudinary
//       await cloudinary.uploader.destroy(req.body.public_id, { type: "upload" });
//       return res.status(200).json({ message: 'Deleted' });
//     } catch (err) {
//       return res.status(500).json({ err: 'Something went wrong' });
//     }
//   }
// );
router.get(
  "/user",
  Auth.checkPermission,
  Auth.checkAdmin,
  userController.getAllUser
);

// router.post(
//   "/upload",
//   Auth.checkPermission,
//   // Auth.checkAdmin,
//   upload.single("image"),
//   async (req, res, next) => {
//     console.log(req.file)
//     try {
//       const fileStr = req.file.path;
//       //console.log("fileStr", fileStr)
//       const uploadResponse = await cloudinary.uploader.upload(fileStr, { folder: "BookingTicket", use_filename: true });
//       console.log(uploadResponse);
//       req.uploadResponse = uploadResponse;
//       next()
//       // return res.status(200).json({ message: 'Thêm ảnh thành công' });
//     } catch (err) {
//       console.error(err);
//       return res.status(500).json({ err: 'Thêm ảnh thất bại' });
//     }
//   }
// );





router.get(
  "/goodSales",
  Auth.checkPermission,
  Auth.checkAdmin,
  showtimeController.goodSales
);

module.exports = router;
