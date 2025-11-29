const reviewModel = require("../models/review-model");
const utilities = require("../utilities/");

async function getVehicleReviews(req, res, next) {
  const inv_id = req.params.inv_id;
  try {
    const reviews = await reviewModel.getReviewsByVehicle(inv_id);
    res.locals.reviews = reviews;
    next();
  } catch (error) {
    next(error);
  }
}

async function addVehicleReview(req, res, next) {
  const { inv_id, review_text, rating } = req.body;
  const account_id = res.locals.accountData.account_id;

  try {
    await reviewModel.addReview(inv_id, account_id, review_text, rating);
    req.flash("notice", "Review submitted successfully!");
    res.redirect(`/inv/detail/${inv_id}`);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getVehicleReviews,
  addVehicleReview
};
