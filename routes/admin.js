const express = require("express");
const router = express.Router();
const movieController = require("../controllers/MoviesController");
const showtimeController = require("../controllers/ShowtimesController");
const accountController = require("../controllers/AccountsController");
const userController = require("../controllers/UsersController");
const FoodDrinksController = require("../controllers/FoodDrinksController");
const {
  validationMovie,
  validationUser,
  isRequestValidated,
  validationShowTime,
  validationFoodsAndDrinks,
} = require("../middleware/Values");
const Auth = require("../middleware/Auth");
//const shortid = require("shortid");
const ShowtimesController = require("../controllers/ShowtimesController");
const upload = require("../services/multer");
require("dotenv").config();
const cloudinary = require("cloudinary").v2;
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
  // validationShowTime,
  // isRequestValidated,
  showtimeController.addListShowtimes//add
);
router.delete(
  "/movie/:bidanh/showtime",
  Auth.checkPermission,
  Auth.checkAdmin,
  // validationShowTime,
  // isRequestValidated,
  showtimeController.delete
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
  "/movie/room",
  /*Auth.checkPermission, Auth.checkAdmin,*/ ShowtimesController.getRoom
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
  upload.fields([
    {
      name: "hinhAnh",
      maxCount: 1,
    },
    {
      name: "anhBia",
      maxCount: 1,
    },
  ]),
  // validationMovie,
  // isRequestValidated,
  movieController.edit
);
router.post(
  "/movie",
  Auth.checkPermission,
  Auth.checkAdmin,
  upload.fields([
    {
      name: "hinhAnh",
      maxCount: 1,
    },
    {
      name: "anhBia",
      maxCount: 1,
    },
  ]),
  // validationMovie,
  // isRequestValidated,
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
//  // console.log(req.body.public_id)
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

router.post(
  "/food_drink",
  Auth.checkPermission,
  Auth.checkAdmin,
  upload.single("hinhAnh"),
  // validationFoodsAndDrinks,
  // isRequestValidated,
  FoodDrinksController.add
);
router.put(
  "/food_drink/:bidanh",
  Auth.checkPermission,
  Auth.checkAdmin,
  upload.single("hinhAnh"),
  FoodDrinksController.update
);

router.delete(
  "/food_drink/:bidanh",
  Auth.checkPermission,
  Auth.checkAdmin,
  FoodDrinksController.delete
);

router.get(
  "/goodSales",
  Auth.checkPermission,
  Auth.checkAdmin,
  showtimeController.goodSales
);

router.get(
  "/ticketBookings",
  Auth.checkPermission,
  Auth.checkAdmin,
  showtimeController.getAllTicketBookings
);

router.post(
  "/revenue",
  Auth.checkPermission,
  Auth.checkAdmin,
  showtimeController.quarterlyRevenue
);

router.get(
  "/revenueByTheater",
  Auth.checkPermission,
  Auth.checkAdmin,
  showtimeController.theaterRevenue
);

router.get(
  "/timelineChart",
  Auth.checkPermission,
  Auth.checkAdmin,
  showtimeController.timelineChart
);
router.get("/",
  Auth.checkPermission,
  Auth.checkAdmin,
  userController.info);

module.exports = router;
