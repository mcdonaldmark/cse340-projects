const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inventory-validation")
const { body } = require("express-validator")

// Visitor-facing pages (no admin check)
router.get("/type/:classificationId", invController.buildByClassificationId)
router.get("/detail/:inv_id", invController.buildByInvId)
router.get("/", invController.buildManagement)
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Admin/Employee pages (protected)
router.get("/add-inventory", utilities.checkJWTToken, utilities.checkAdmin, invController.buildAddInventory)
router.get("/add-classification", utilities.checkJWTToken, utilities.checkAdmin, invController.buildAddClassification)
router.get("/edit/:inv_id", utilities.checkJWTToken, utilities.checkAdmin, utilities.handleErrors(invController.buildEditInventory))
router.get("/delete/:inv_id", utilities.checkJWTToken, utilities.checkAdmin, utilities.handleErrors(invController.buildDeleteInventory))

/* Add Inventory */
router.post(
  "/add-inventory",
  utilities.checkJWTToken,
  utilities.checkAdmin,
  body("classification_id").notEmpty().withMessage("Classification is required."),
  body("inv_make").trim().notEmpty().withMessage("Make is required."),
  body("inv_model").trim().notEmpty().withMessage("Model is required."),
  body("inv_description").optional({ checkFalsy: true }).trim().isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters."),
  body("inv_year").notEmpty().withMessage("Year is required.").matches(/^\d{4}$/).withMessage("Year must be a 4-digit number."),
  body("inv_miles").notEmpty().withMessage("Mileage is required.").isInt({ min: 0 }).withMessage("Mileage must be a positive integer."),
  body("inv_price").notEmpty().withMessage("Price is required.").isFloat({ gt: 0 }).withMessage("Price must be a positive number."),
  body("inv_color").trim().notEmpty().withMessage("Color is required."),
  invController.addInventory
)

/* Add Classification */
router.post(
  "/add-classification",
  utilities.checkJWTToken,
  utilities.checkAdmin,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  invController.addClassification
)

/* Update Inventory */
router.post(
  "/update",
  utilities.checkJWTToken,
  utilities.checkAdmin,
  invValidate.newInventoryRules(),
  invValidate.checkUpdateData,
  invController.updateInventory
)

/* Delete Inventory */
router.post(
  "/delete",
  utilities.checkJWTToken,
  utilities.checkAdmin,
  utilities.handleErrors(invController.deleteInventory)
)

module.exports = router