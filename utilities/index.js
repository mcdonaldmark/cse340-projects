const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    console.log(data)
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build HTML for a vehicle detail view
* Expects a single vehicle object row
* Returns an HTML string (detail)
* *************************************/
Util.buildVehicleDetail = async function(vehicle){
  if(!vehicle) return '<p class="notice">Vehicle details not available.</p>'

  const make = vehicle.inv_make || ''
  const model = vehicle.inv_model || ''
  const year = vehicle.inv_year || ''
  const description = vehicle.inv_description || ''
  const color = vehicle.inv_color || ''
  const miles = vehicle.inv_miles != null ? new Intl.NumberFormat('en-US').format(vehicle.inv_miles) : 'N/A'
  const price = vehicle.inv_price != null ? new Intl.NumberFormat('en-US').format(vehicle.inv_price) : 'N/A'
  const image = vehicle.inv_image || vehicle.inv_thumbnail || '/images/no-image.png'
  const classification = vehicle.classification_name || ''

  let detail = ''
  detail += `<div class="vehicle-detail">`
  detail += `  <div class="vehicle-image">`
  detail += `    <img src="${image}" alt="Image of ${make} ${model}" />`
  detail += `  </div>`
  detail += `  <div class="vehicle-info">`
  detail += `    <h2>${make} ${model} ${year ? `<span class="year">(${year})</span>` : ''}</h2>`
  detail += `    <p class="vehicle-desc">${description}</p>`
  detail += `    <ul class="vehicle-meta">`
  detail += `      <li><strong>Price:</strong> $${price}</li>`
  detail += `      <li><strong>Mileage:</strong> ${miles} miles</li>`
  detail += `      <li><strong>Color:</strong> ${color}</li>`
  detail += `      <li><strong>Classification:</strong> ${classification}</li>`
  detail += `    </ul>`
  detail += `  </div>`
  detail += `</div>`

  return detail
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util