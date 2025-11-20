const utilities = require("../utilities/")
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  // Create an empty validationResult object for the first render
  const errors = validationResult(req); 
  res.render("account/login", {
    title: "Login",
    nav,
    notice: req.flash("notice"),
    errors,                 // <--- this works with errors.array()
    account_email: ""       // optional sticky field
  });
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    notice: req.flash("notice")
  })
}

/* ****************************************
*  Process Login
* *************************************** */
async function loginAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  let errors = null // initialize errors

  try {
    // Look up the account by email
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
      errors = [{ msg: "Email or password incorrect." }]
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        notice: req.flash("notice"),
        errors,
        account_email // for sticky email
      })
    }

    // Compare hashed password
    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password)
    if (!passwordMatch) {
      errors = [{ msg: "Email or password incorrect." }]
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        notice: req.flash("notice"),
        errors,
        account_email
      })
    }

    // Login successful → store session
    req.session.account = {
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_email: accountData.account_email
    }
    res.redirect("/account/admin") // or your logged-in landing page
  } catch (error) {
    console.error(error)
    errors = [{ msg: "Login failed. Please try again." }]
    res.status(500).render("account/login", {
      title: "Login",
      nav,
      notice: req.flash("notice"),
      errors,
      account_email
    })
  }
}



module.exports = { buildLogin, buildRegister, registerAccount, loginAccount }
