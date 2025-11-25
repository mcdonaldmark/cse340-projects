const { body, validationResult } = require("express-validator");
const utilities = require(".");
const invModel = require("../models/inventory-model");

const validate = {};

/* **************************
 * Classification validation
 **************************/
validate.classificationRules = () => [
  body("classification_name")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Please provide a classification name.")
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Classification must not contain spaces or special characters.")
];

/* **************************
 * Inventory validation for add/update
 **************************/
validate.newInventoryRules = () => [
  body("classification_id").notEmpty().withMessage("Please select a classification."),
  body("inv_make").trim().isLength({ min: 3 }).withMessage("Make must be at least 3 characters."),
  body("inv_model").trim().isLength({ min: 1 }).withMessage("Model must be at least 1 character."),
  body("inv_year").trim().isInt({ min: 1900, max: 2100 }).withMessage("Year must be a valid 4-digit number."),
  body("inv_miles").trim().isInt().withMessage("Mileage must be a number."),
  body("inv_price").trim().isFloat({ min: 0 }).withMessage("Price must be a number."),
  body("inv_color").trim().isAlpha().withMessage("Color must only contain letters."),
  body("inv_description").trim().notEmpty().withMessage("Description is required.")
];

/* **************************
 * Check classification errors
 **************************/
validate.checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: errors.array(),
      messages: null
    });
  }
  next();
};

/* **************************
 * Check inventory update errors
 **************************/
validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req);
  const { inv_id, classification_id, inv_make, inv_model, inv_description, inv_year, inv_miles, inv_image, inv_thumbnail, inv_price, inv_color } = req.body;

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(classification_id);
    return res.render("inventory/edit-inventory", {
      title: `Edit ${inv_make} ${inv_model}`,
      nav,
      inv_id,
      classificationList,
      errors: errors.array(),
      messages: null,
      vehicle: { inv_id, classification_id, inv_make, inv_model, inv_description, inv_year, inv_miles, inv_image, inv_thumbnail, inv_price, inv_color }
    });
  }
  next();
};

module.exports = validate;
