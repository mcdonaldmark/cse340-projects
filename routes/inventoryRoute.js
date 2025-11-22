const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")

router.get("/type/:classificationId", invController.buildByClassificationId);

router.get("/detail/:inv_id", invController.buildByInvId);

router.get("/", invController.buildManagement);

const invValidate = require("../utilities/inventory-validation");

router.get("/add-inventory", invController.buildAddInventory)

router.get("/add-classification", invController.buildAddClassification);

router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  invController.addClassification
);

const { body } = require("express-validator")

router.post(
  "/add-inventory",
  body("classification_id").notEmpty().withMessage("Classification is required."),
  body("inv_make").trim().notEmpty().withMessage("Make is required."),
  body("inv_model").trim().notEmpty().withMessage("Model is required."),
  body("inv_description")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters."),
  body("inv_year")
    .notEmpty().withMessage("Year is required.")
    .matches(/^\d{4}$/).withMessage("Year must be a 4-digit number."),
  body("inv_miles")
    .notEmpty().withMessage("Mileage is required.")
    .isInt({ min: 0 }).withMessage("Mileage must be a positive integer."),
  body("inv_price")
    .notEmpty().withMessage("Price is required.")
    .isFloat({ gt: 0 }).withMessage("Price must be a positive number."),
  body("inv_color")
    .trim()
    .notEmpty().withMessage("Color is required."),
  invController.addInventory
)

module.exports = router;