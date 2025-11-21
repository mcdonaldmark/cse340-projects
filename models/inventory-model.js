const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 *  Get single vehicle by inv_id
 * ************************** */
async function getVehicleById(inv_id) {
  try {
    const sql = `SELECT i.*, c.classification_name
                 FROM public.inventory AS i
                 JOIN public.classification AS c
                   ON i.classification_id = c.classification_id
                 WHERE i.inv_id = $1`
    const result = await pool.query(sql, [inv_id])
    return result.rows[0]
  } catch (error) {
    console.error("getVehicleById error: " + error)
  }
}

async function addClassification(classification_name) {
  try {
    const sql = `
      INSERT INTO classification (classification_name)
      VALUES ($1)
      RETURNING *;
    `;
    return await pool.query(sql, [classification_name]);
  } catch (error) {
    console.error("Add Classification Error:", error);
    return null;
  }
}

async function addInventory(vehicle) {
  try {
    const sql = `
      INSERT INTO inventory
      (classification_id, inv_make, inv_model, inv_description, inv_year, inv_miles, inv_image, inv_thumbnail, inv_price, inv_color)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *;
    `
    const values = [
      vehicle.classification_id,
      vehicle.inv_make,
      vehicle.inv_model,
      vehicle.inv_description,
      vehicle.inv_year,
      vehicle.inv_miles,
      vehicle.inv_image,
      vehicle.inv_thumbnail,
      vehicle.inv_price,
      vehicle.inv_color
    ]
    return await pool.query(sql, values)
  } catch (error) {
    console.error("Add Inventory Error:", error)
    return null
  }
}

module.exports = {getClassifications, getInventoryByClassificationId, getVehicleById, addClassification, addInventory}