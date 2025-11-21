const invModel = require("../models/inventory-model")
const { validationResult } = require("express-validator")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory detail view
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  const inv_id = req.params.inv_id
  const data = await invModel.getVehicleById(inv_id)
  const detail = await utilities.buildVehicleDetail(data)
  let nav = await utilities.getNav()
  res.render("./inventory/detail", {
    title: `${data.inv_make} ${data.inv_model} Details`,
    nav,
    detail,
    vehicle: data
  })
}

invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav();

  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    messages: req.flash("notice")
  });
};

/* ********************************
 *  Deliver Add Classification Form
 ******************************** */
invCont.buildAddClassification = async function (req, res) {
  let nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
    messages: req.flash("notice")
  });
};

/* ********************************
 *  Process Add Classification Form
 ******************************** */
invCont.addClassification = async function (req, res) {
  let nav = await utilities.getNav();
  const { classification_name } = req.body;

  const result = await invModel.addClassification(classification_name);

  if (result) {
    req.flash("notice", `Successfully added ${classification_name} classification.`);
    nav = await utilities.getNav(); // regenerate nav to include new classification
    return res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      messages: req.flash("notice"),
      errors: null
    });
  } else {
    req.flash("notice", "Failed to add classification.");
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      messages: req.flash("notice"),
      errors: null
    });
  }
};

module.exports = invCont;