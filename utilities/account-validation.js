const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const validate = {}

/* **********************************
 * Registration Data Validation
 * ********************************* */
validate.registrationRules = () => {
  return [
    body("account_firstname").trim().isLength({ min: 1 }).withMessage("Please provide a first name."),
    body("account_lastname").trim().isLength({ min: 2 }).withMessage("Please provide a last name."),
    body("account_email")
      .trim()
      .isEmail().withMessage("A valid email is required.")
      .normalizeEmail()
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists){
          throw new Error("Email exists. Please log in or use different email")
        }
      }),
    body("account_password")
      .trim()
      .isStrongPassword({ minLength: 12, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
      .withMessage("Password does not meet requirements."),
  ]
}

validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      messages: req.flash("notice")
    })
  }
  next()
}

/* **********************************
 * Login Validation
 * ********************************* */
validate.loginRules = () => {
  return [
    body("account_email").trim().isEmail().withMessage("A valid email is required."),
    body("account_password").trim().notEmpty().withMessage("Password is required."),
  ]
}

validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render("account/login", { title: "Login", nav, errors, account_email })
  }
  next()
}

/* **********************************
 * Account Update Validation
 * ********************************* */
validate.updateRules = () => {
  return [
    body("account_firstname").trim().isLength({ min: 1 }).withMessage("Please provide a first name."),
    body("account_lastname").trim().isLength({ min: 2 }).withMessage("Please provide a last name."),
    body("account_email")
      .trim()
      .isEmail().withMessage("A valid email is required.")
      .normalizeEmail()
      .custom(async (account_email, { req }) => {
        const account_id = req.params.id;
        const existing = await accountModel.getAccountByEmail(account_email);
        if (existing && existing.account_id != account_id) {
          throw new Error("Email exists. Please use a different email.");
        }
      }),
    body("account_password")
      .optional({ checkFalsy: true })
      .isStrongPassword({ minLength: 12, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
      .withMessage("Password does not meet requirements."),
    body("account_password_confirm")
      .custom((value, { req }) => {
        if (req.body.account_password && value !== req.body.account_password) {
          throw new Error("Passwords do not match.");
        }
        return true;
      })
  ]
}

validate.checkUpdateData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render("account/update", {
      title: "Update Account",
      nav,
      errors,
      account: {
        account_id: req.params.id,
        account_firstname,
        account_lastname,
        account_email
      },
      messages: req.flash("notice")
    })
  }
  next()
}

module.exports = validate
