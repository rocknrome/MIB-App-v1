const pool = require('../config/db');

exports.getAllClients = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clients');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.createClient = async (req, res) => {
  const {
    last_name,
    first_name,
    street_address,
    city,
    state,
    zip,
    tags,
    phone,
    email,
    tax_exempt,
    admin_notes,
    team_notes,
    latitude,
    longitude,
    plantation_id,
    weekly,
    client_type,
    payment_method,
    credit_card_number,
    credit_card_expiry,
    credit_card_cvv,
    billing_address_same,
    billing_street_address,
    billing_city,
    billing_state,
    billing_zip
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO clients (
        last_name, first_name, street_address, city, state, zip, tags, phone, email, tax_exempt,
        admin_notes, team_notes, latitude, longitude, plantation_id, weekly, client_type,
        payment_method, credit_card_number, credit_card_expiry, credit_card_cvv,
        billing_address_same, billing_street_address, billing_city, billing_state, billing_zip
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
      $18, $19, $20, $21, $22, $23, $24, $25, $26) RETURNING *`,
      [
        last_name, first_name, street_address, city, state, zip, tags, phone, email, tax_exempt,
        admin_notes, team_notes, latitude, longitude, plantation_id, weekly, client_type,
        payment_method, credit_card_number, credit_card_expiry, credit_card_cvv,
        billing_address_same, billing_street_address, billing_city, billing_state, billing_zip
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.updateClient = async (req, res) => {
  const { id } = req.params;
  const {
    last_name,
    first_name,
    street_address,
    city,
    state,
    zip,
    tags,
    phone,
    email,
    tax_exempt,
    admin_notes,
    team_notes,
    latitude,
    longitude,
    plantation_id,
    weekly,
    client_type,
    payment_method,
    credit_card_number,
    credit_card_expiry,
    credit_card_cvv,
    billing_address_same,
    billing_street_address,
    billing_city,
    billing_state,
    billing_zip
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE clients SET
        last_name = $1, first_name = $2, street_address = $3, city = $4, state = $5, zip = $6,
        tags = $7, phone = $8, email = $9, tax_exempt = $10, admin_notes = $11, team_notes = $12,
        latitude = $13, longitude = $14, plantation_id = $15, weekly = $16, client_type = $17,
        payment_method = $18, credit_card_number = $19, credit_card_expiry = $20, credit_card_cvv = $21,
        billing_address_same = $22, billing_street_address = $23, billing_city = $24, billing_state = $25, billing_zip = $26,
        updated_at = CURRENT_TIMESTAMP WHERE id = $27 RETURNING *`,
      [
        last_name, first_name, street_address, city, state, zip, tags, phone, email, tax_exempt,
        admin_notes, team_notes, latitude, longitude, plantation_id, weekly, client_type,
        payment_method, credit_card_number, credit_card_expiry, credit_card_cvv,
        billing_address_same, billing_street_address, billing_city, billing_state, billing_zip, id
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.deleteClient = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM clients WHERE id = $1', [id]);
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
