const db = require('./db');

const getUserByUsername = async (username) => {
  const result = await db.query(`SELECT * FROM users WHERE username = $1`, [username]);
  return result.rows[0];
};

const createUser = async (username, passwordHash, fullName, role, employeeCode) => {
  const result = await db.query(
    `INSERT INTO users (username, password_hash, full_name, role, employee_code)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, username, role, employee_code`,
    [username, passwordHash, fullName, role, employeeCode]
  );
  return result.rows[0];
};

module.exports = { getUserByUsername, createUser };