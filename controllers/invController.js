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

// Deliver Add Inventory Form
invCont.buildAddInventory = async function (req, res) {
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    classificationList,
    errors: null,
    messages: req.flash("notice"),
    vehicle: null
  })
}

// Deliver Add Inventory Form
invCont.buildAddInventory = async function (req, res) {
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    classificationList,
    errors: null,
    messages: req.flash("notice"),
    vehicle: null
  })
}

// Process Add Inventory Form
invCont.addInventory = async function (req, res) {
  const { classification_id, inv_make, inv_model, inv_description, inv_year, inv_miles, inv_image, inv_thumbnail, inv_price, inv_color } = req.body
  const errors = validationResult(req)
  let nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList(classification_id)

  if (!errors.isEmpty()) {
    return res.render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      errors: errors.array(),
      messages: null,
      vehicle: req.body
    })
  }

  const vehicleData = {
    classification_id,
    inv_make,
    inv_model,
    inv_description,
    inv_year: parseInt(inv_year),
    inv_miles: parseInt(inv_miles),
    inv_image: inv_image || "/images/no-image.png",
    inv_thumbnail: inv_thumbnail || "/images/no-image.png",
    inv_price: parseFloat(inv_price) || 0,
    inv_color
  }

  const result = await invModel.addInventory(vehicleData)

  if (result) {
    req.flash("notice", `Successfully added ${inv_make} ${inv_model}.`)
    nav = await utilities.getNav()
    return res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      messages: req.flash("notice"),
      errors: null
    })
  } else {
    req.flash("notice", "Failed to add vehicle.")
    return res.render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      messages: req.flash("notice"),
      errors: null,
      vehicle: req.body
    })
  }
}

module.exports = invCont;