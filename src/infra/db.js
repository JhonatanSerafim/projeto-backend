import pkg from 'pg'
const { Pool } = pkg
import dotenv from 'dotenv'

dotenv.config()

const DATABASE_URL = process.env.DATABASE_URL

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Para desenvolvimento local
  }
})

export default pool