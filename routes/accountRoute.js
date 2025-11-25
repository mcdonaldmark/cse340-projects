const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/");
const regValidate = require('../utilities/account-validation');
const accountController = require("../controllers/accountController");

// Login & Register Views
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Logout
router.get("/logout", (req, res) => {
    res.clearCookie("jwt");
    req.flash("notice", "You have been logged out.");
    res.redirect("/");
});

// Registration POST
router.post(
    "/register",
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
);

// Login POST
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
);

// Account Management View
router.get(
    "/",
    utilities.checkLogin,
    utilities.handleErrors(accountController.buildAccountManagement)
);

// Build Account Update View
router.get(
    "/update/:id",
    utilities.checkLogin,
    utilities.handleErrors(accountController.buildUpdateAccount)
);

// Process Account Update POST
router.post(
    "/update/:id",
    utilities.checkLogin,
    regValidate.updateRules(),
    regValidate.checkUpdateData,
    utilities.handleErrors(accountController.updateAccount)
);

module.exports = router;
