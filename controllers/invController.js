const invModel = require("../models/inventory-model")
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
  const data = await invModel.getVehicleById(inv_id) // returns single row (object) or undefined
  if (!data) {
    // no vehicle found
    return res.status(404).render("errors/error", {
      title: "Not found",
      message: "Sorry, that vehicle could not be found.",
      nav: await utilities.getNav(),
    })
  }

  // build the HTML block (or plain data) for the detail page
  const detail = await utilities.buildVehicleDetail(data)
  let nav = await utilities.getNav()

  res.render("./inventory/detail", {
    title: `${data.inv_make} ${data.inv_model} Details`,
    nav,
    detail, // html string
    vehicle: data // pass vehicle in case you want raw fields in view
  })
}


  module.exports = invCont