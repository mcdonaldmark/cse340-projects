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
  let nav = await utilities.getNav()

  let className = data.length > 0 ? data[0].classification_name : "No Vehicles Found"
  const grid = await utilities.buildClassificationGrid(data)

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

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav();
  const classificationList = await utilities.buildClassificationList()
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    classificationList,
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
  const { classification_name } = req.body;

  // Insert new classification
  const result = await invModel.addClassification(classification_name);

  if (result) {
    req.flash("notice", `Successfully added ${classification_name} classification.`);

    // 🔥 Rebuild nav AFTER the insert (important!)
    let nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();

    return res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      messages: req.flash("notice"),
      errors: null,
      classificationList
    });
  } else {
    let nav = await utilities.getNav();
    req.flash("notice", "Failed to add classification.");
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      messages: req.flash("notice"),
      errors: null
    });
  }
};

/* ********************************
 *  Build Add Inventory Form
 ******************************** */
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

/* ********************************
 *  Process Add Inventory Form
 ******************************** */
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
    const updatedClassificationList = await utilities.buildClassificationList()
    return res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      messages: req.flash("notice"),
      errors: null,
      classificationList: updatedClassificationList
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0]?.inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getVehicleById(inv_id)

  const classificationList = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationList: classificationList,
    errors: null,
    vehicle: itemData,
    messages: req.flash("notice"),
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationList = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationList,      // ← use classificationList
      errors: null,
      vehicle: {
        inv_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id
      },
      messages: req.flash("notice")
    })
  }
}

/* ****************************************
 *  Build Delete Confirmation View
 * **************************************** */
invCont.buildDeleteInventory = async function (req, res, next) {
  const inv_id = req.params.inv_id
  let nav = await utilities.getNav()
  const vehicleData = await invModel.getVehicleById(inv_id)

  const name = `${vehicleData.inv_make} ${vehicleData.inv_model}`

  res.render("inventory/delete-confirm", {
    title: "Delete " + name,
    nav,
    errors: null,
    messages: req.flash("notice"),
    vehicle: vehicleData
  })
}

/* ****************************************
 *  Process Inventory Item Deletion
 * **************************************** */
invCont.deleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id)

  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  if (deleteResult) {
    req.flash("notice", "The vehicle was successfully deleted.")
    return res.redirect("/inv/")
  } else {
    req.flash("notice", "The delete failed. Please try again.")
    return res.redirect(`/inv/delete/${inv_id}`)
  }
}

module.exports = invCont
