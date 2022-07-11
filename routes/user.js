const express = require('express');
const router = express.Router();
const Auth = require('../middleware/Auth')
const showtimeController = require('../controllers/showtimeController');
const userController = require('../controllers/UserController');
const { validationUser, isRequestValidated, validationChangePassword } = require('../middleware/Values');
const emailServices = require('../services/emailServices');
// router.post('/signin', userController.signIn);
// router.post('/signUp', userController.signUp);

router.post('/:bidanh/showtime/:IDshowtime', Auth.checkPermission, Auth.checkUser, showtimeController.ticketBooking);
router.get('/:bidanh/showtime/getchair', Auth.checkPermission, Auth.checkUser, showtimeController.getAllChair);
router.post('/changeTicketBooking/:IDTicket', Auth.checkPermission, Auth.checkUser, userController.changeTicketBooking);
router.get('/history/:IDticket', Auth.checkPermission, Auth.checkUser, userController.getHistoryTicketById);
router.get('/history', Auth.checkPermission, Auth.checkUser, userController.history); ///user/:id/editPassword
router.put('/editPassword', Auth.checkPermission, Auth.checkUser, validationChangePassword, isRequestValidated, userController.editPassword);
router.get('/cancelBooking/:IDTicket', Auth.checkPermission, Auth.checkUser, userController.cancelBooking);
router.post('/sendEmailBooking', Auth.checkPermission, Auth.checkUser, emailServices.sendEmail);
router.get('/reminderEmail', emailServices.sendReminderMail);
router.post('/sendchangeTicketMail', Auth.checkPermission, Auth.checkUser, emailServices.sendchangeTicketMail);
router.get('/', Auth.checkPermission, Auth.checkUser, userController.info);
router.put('/', Auth.checkPermission, Auth.checkUser, validationUser, isRequestValidated, userController.edit);




// router.get('/infor', userController.checkPermission, userController.checkUser, userController.infor);
// //router.get('/infor', userController.checkPermission,  userController.infor);//Kiểm tra quyền cách 2
// //phim
// router.get('/show', userController.show);
// router.get('/detail/:bidanh', userController.showOne);


module.exports = router;