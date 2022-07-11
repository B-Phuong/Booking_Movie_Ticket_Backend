const express = require('express');
const router = express.Router();
const movieController = require('../controllers/MovieController');
const showtimeController = require('../controllers/ShowtimeController');
const { validationBook, isRequestValidated } = require('../middleware/Values');
const Auth = require('../middleware/Auth')
const multer = require("multer");
//const shortid = require("shortid");
const path = require("path");


// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads");
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });
// const upload = multer({ storage: storage });




//router.get('/:bidanh/showtime', showtimeController.getShowtime);
router.get('/cluster/:maCumRap', movieController.showMovieByCluster);
router.get('/:biDanh', movieController.showDetail); //
router.get('/', movieController.show);


//getAllChair






module.exports = router;