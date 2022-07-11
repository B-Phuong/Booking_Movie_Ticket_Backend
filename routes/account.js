const express = require('express');
const Auth = require('../middleware/Auth')
const { isRequestValidated, validationSignIn, validationSignUp } = require('../middleware/Values');
const router = express.Router();

const accountController = require('../controllers/AccountController');
router.post('/signin', validationSignIn, isRequestValidated, accountController.signIn);
router.post('/signUp', validationSignUp, isRequestValidated, accountController.signUp);




module.exports = router;