const pool = require("../database/");

async function getReviewsByVehicle(inv_id) {
  try {
    const sql = `
      SELECT r.*, a.account_firstname, a.account_lastname
      FROM reviews AS r
      JOIN account AS a ON r.account_id = a.account_id
      WHERE r.inv_id = $1
      ORDER BY r.review_date DESC
    `;
    const result = await pool.query(sql, [inv_id]);
    return result.rows;
  } catch (error) {
    console.error("getReviewsByVehicle error: " + error);
    return [];
  }
}

async function addReview(inv_id, account_id, review_text, rating) {
  try {
    const sql = `
      INSERT INTO reviews (inv_id, account_id, review_text, rating)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await pool.query(sql, [inv_id, account_id, review_text, rating]);
    return result.rows[0];
  } catch (error) {
    console.error("addReview error: " + error);
    return null;
  }
}

module.exports = {
  getReviewsByVehicle,
  addReview
};
