const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/");
const regValidate = require('../utilities/account-validation');
const accountController = require("../controllers/accountController");

router.get("/login", utilities.handleErrors(accountController.buildLogin));

router.get("/register", utilities.handleErrors(accountController.buildRegister));

router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.loginAccount)
)


module.exports = router;