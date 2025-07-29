import Fastify from 'fastify'
import pkg from 'pg'
const { Pool } = pkg

const api = Fastify({
  logger: true
})

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_kX2yuJx3dwMA@ep-nameless-shadow-aczyrles-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: FileSystemWritableFileStream
  }
})

api.get('/', function (request, reply) {
  reply.send({ hello: 'world' })
})

api.get('/status', async (request, reply) => {
  try {
    const result = await pool.query('SELECT NOW()')
    reply.send({ serverTime: result.rows[0].now })
  } catch (err) {
    api.log.error(err)
    reply.code(500).send({ error: 'Erro ao conectar ao banco de dados' })
  }
})

api.get('/users', async (request, reply) => {
  try {
    const result = await pool.query('SELECT * FROM users')
    reply.send(result.rows)
  } catch (err) {
    api.log.error(err)
    reply.code(500).send({ error: 'Erro ao buscar usuários no banco de dados' })
  }
})

const start = async () => {
  try {
    await api.listen({ port: 3000 })
  } catch (err) {
    api.log.error(err)
    process.exit(1)
  }
}
start()