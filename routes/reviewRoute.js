const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const utilities = require("../utilities/");

// Add review (POST)
router.post(
  "/add",
  utilities.checkJWTToken,
  utilities.checkLogin,
  reviewController.addVehicleReview
);

module.exports = router;
