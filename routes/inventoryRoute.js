const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")

router.get("/type/:classificationId", invController.buildByClassificationId);

router.get("/detail/:inv_id", invController.buildByInvId);

router.get("/", invController.buildManagement);

const invValidate = require("../utilities/inventory-validation");

router.get("/add-inventory", invController.buildAddInventory)

// Deliver the form
router.get("/add-classification", invController.buildAddClassification);

// Handle the form submission
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  invController.addClassification
);

// Process Add Inventory Form
const { body } = require("express-validator")

router.post(
  "/add-inventory",
  body("classification_id").notEmpty().withMessage("Classification is required."),
  body("inv_make").trim().notEmpty().withMessage("Make is required."),
  body("inv_model").trim().notEmpty().withMessage("Model is required."),
  body("inv_description").trim().notEmpty().withMessage("Description is required."),
  body("inv_price").isFloat({ gt: 0 }).withMessage("Price must be a positive number."),
  body("inv_color").trim().notEmpty().withMessage("Color is required."),
  invController.addInventory
)

module.exports = router;