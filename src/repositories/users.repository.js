import pool from '../infra/db.js'

export async function getAllUsers() {
  const result = await pool.query('SELECT * FROM users')
  return result.rows
}

export async function getServerTime() {
  const result = await pool.query('SELECT NOW()')
  return result.rows[0].now
}

export async function createUser(userData) {
  const { nome, idade, cep, localidade, uf, bairro, logradouro, numero } = userData
  const result = await pool.query(
    `INSERT INTO users (nome, idade, cep, localidade, uf, bairro, logradouro, numero)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [nome, idade, cep, localidade, uf, bairro, logradouro, numero]
  )
  return result.rows[0]
}

export async function updateUser(id, userData) {
  const { nome, idade, cep, localidade, uf, bairro, logradouro, numero } = userData
  const result = await pool.query(
    `UPDATE users SET
       nome = $1, idade = $2, cep = $3, localidade = $4,
       uf = $5, bairro = $6, logradouro = $7, numero = $8
     WHERE id = $9 RETURNING *`,
    [nome, idade, cep, localidade, uf, bairro, logradouro, numero, id]
  )
  return result.rows[0]
}

export async function deleteUser(id) {
  const result = await pool.query(
    'DELETE FROM users WHERE id = $1 RETURNING *',
    [id]
  )
  return result.rows[0]
}