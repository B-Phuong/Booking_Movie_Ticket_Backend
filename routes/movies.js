const express = require('express');
const router = express.Router();
const movieController = require('../controllers/MoviesController');
const showtimeController = require('../controllers/ShowtimesController');
const { validationBook, isRequestValidated } = require('../middleware/Values');
const Auth = require('../middleware/Auth')
//const shortid = require("shortid");
const path = require("path");

//router.get('/:bidanh/showtime', showtimeController.getShowtime);
router.get('/cluster/:maCumRap', movieController.showMovieByCluster);
router.get('/coming', movieController.showMovieComing); //
router.get("/movietheater", showtimeController.getMovieTheater);
router.get('/:biDanh', movieController.showDetail); //

router.get('/', movieController.show);

module.exports = router;