const utilities = require("../utilities/")
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const pool = require("../database/")

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email: ""
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      account_email: ""
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
      errors: null,
      account_email:"" 
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      account_email:""
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

  const accountData = await accountModel.checkExistingEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Email not found. Please register first.")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }

  const sql = "SELECT * FROM account WHERE account_email = $1"
  const result = await pool.query(sql, [account_email])
  const account = result.rows[0]

  const match = await bcrypt.compare(account_password, account.account_password)

  if (!match) {
    req.flash("notice", "Incorrect password.")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }

  req.flash("notice", `Welcome back, ${account.account_firstname}.`)
  return res.redirect("/")
}

module.exports = { buildLogin, buildRegister, registerAccount, loginAccount }
