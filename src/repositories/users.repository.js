import pool from '../infra/db.js'

export async function getAllUsers() {
  const result = await pool.query('SELECT * FROM users')
  return result.rows
}

export async function getServerTime() {
  const result = await pool.query('SELECT NOW()')
  return result.rows[0].now
}