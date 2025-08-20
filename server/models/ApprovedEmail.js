// Modelo PostgreSQL para emails permitidos
const { Pool } = require('pg');
const pool = require('../db');

class ApprovedEmail {
  static async isApproved(email) {
    const query = 'SELECT * FROM approved_emails WHERE email = $1';
    const { rows } = await pool.query(query, [email]);
    return rows.length > 0;
  }

  static async create(email, role = 'user') {
    const query = `
      INSERT INTO approved_emails (email, role) 
      VALUES ($1, $2) 
      RETURNING *`;
    const values = [email, role];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM approved_emails WHERE email = $1';
    const { rows } = await pool.query(query, [email]);
    return rows[0];
  }

  static async getAll() {
    const { rows } = await pool.query('SELECT * FROM approved_emails');
    return rows;
  }
}

module.exports = ApprovedEmail;
