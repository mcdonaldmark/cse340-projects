const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")

router.get("/type/:classificationId", invController.buildByClassificationId);

router.get("/detail/:inv_id", invController.buildByInvId);

router.get("/", invController.buildManagement);

const invValidate = require("../utilities/inventory-validation");

// Deliver the form
router.get("/add-classification", invController.buildAddClassification);

// Handle the form submission
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  invController.addClassification
);

module.exports = router;