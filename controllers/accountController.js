const utilities = require("../utilities/");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
 *  Deliver login view
 **************************************** */
async function buildLogin(req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email: "",
      messages: req.flash("notice")
    });
  } catch (error) {
    next(error);
  }
}

/* ****************************************
 *  Deliver registration view
 **************************************** */
async function buildRegister(req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
      messages: req.flash("notice")
    });
  } catch (error) {
    next(error);
  }
}

/* ****************************************
 *  Process registration
 **************************************** */
async function registerAccount(req, res, next) {
  try {
    let nav = await utilities.getNav();
    const { account_firstname, account_lastname, account_email, account_password } = req.body;

    const hashedPassword = await bcrypt.hash(account_password, 10);
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    );

    if (regResult) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
      return res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email: "",
        messages: req.flash("notice")
      });
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      return res.status(501).render("account/register", {
        title: "Registration",
        nav,
        account_email: "",
        messages: req.flash("notice")
      });
    }
  } catch (error) {
    next(error);
  }
}

/* ****************************************
 *  Process login request (JWT version)
 **************************************** */
async function accountLogin(req, res, next) {
  try {
    let nav = await utilities.getNav();
    const { account_email, account_password } = req.body;
    const accountData = await accountModel.getAccountByEmail(account_email);

    if (!accountData) {
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
        messages: req.flash("notice")
      });
    }

    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
      res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 3600 * 1000
      });
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
        messages: req.flash("notice")
      });
    }
  } catch (error) {
    next(error);
  }
}

/* ****************************************
 *  Deliver account management view
 **************************************** */
async function buildAccountManagement(req, res, next) {
  try {
    let nav = await utilities.getNav();
    const accountData = res.locals.accountData || null;

    res.render("account/management", {
      title: "Account Management",
      nav,
      messages: req.flash("notice"),
      errors: null,
      accountData
    });
  } catch (error) {
    next(error);
  }
}

/* ****************************************
 *  Deliver account update view
 **************************************** */
async function buildUpdateAccount(req, res, next) {
  try {
    let nav = await utilities.getNav();
    const account_id = req.params.id;

    // Always fetch fresh account data from DB
    const account = await accountModel.getAccountById(account_id);

    res.render("account/update", {
      title: "Update Account",
      nav,
      messages: req.flash("notice"),
      errors: null,
      account
    });
  } catch (error) {
    next(error);
  }
}

/* ****************************************
 *  Process account update
 **************************************** */
async function updateAccount(req, res, next) {
  try {
    const account_id = req.params.id;
    const account = await accountModel.getAccountById(account_id);

    if (!account) {
      req.flash("notice", "Account not found.");
      return res.redirect("/account/");
    }

    const { account_firstname, account_lastname, account_email, account_password, account_password_confirm } = req.body;
    let updatedFields = [];

    // Update password if changed
    if (account_password || account_password_confirm) {
      if (account_password !== account_password_confirm) {
        req.flash("notice", "Passwords do not match.");
        return res.redirect(`/account/update/${account_id}`);
      }
      const hashedPassword = await bcrypt.hash(account_password, 10);
      await accountModel.updatePassword(account_id, hashedPassword);
      updatedFields.push("password");
    }

    // Update account info if changed
    if (
      account_firstname !== account.account_firstname ||
      account_lastname !== account.account_lastname ||
      account_email !== account.account_email
    ) {
      await accountModel.updateAccountInfo(account_id, account_firstname, account_lastname, account_email);
      updatedFields.push("account info");
    }

    // Set flash message
    if (updatedFields.includes("password") && updatedFields.includes("account info")) {
      req.flash("notice", "Account information and password updated successfully.");
    } else if (updatedFields.includes("password")) {
      req.flash("notice", "Password updated successfully.");
    } else if (updatedFields.includes("account info")) {
      req.flash("notice", "Account information updated successfully.");
    } else {
      req.flash("notice", "No changes were made.");
    }

    // Redirect to Account Management page
    return res.redirect("/account/");
  } catch (error) {
    next(error);
  }
}

/* ****************************************
 *  Logout
 **************************************** */
async function logout(req, res, next) {
  try {
    res.clearCookie("jwt");
    if (req.session) {
      req.session.destroy(() => {});
    }
    req.flash("notice", "You have been logged out.");
    return res.redirect("/");
  } catch (error) {
    next(error);
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagement,
  buildUpdateAccount,
  updateAccount,
  logout
};
