import Fastify from 'fastify'
import pkg from 'pg'
const { Pool } = pkg

const api = Fastify({
  logger: true
})

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_kX2yuJx3dwMA@ep-nameless-shadow-aczyrles-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: true
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

api.post('/users', async (req, rep) => {
  const { nome, idade, cep, localidade, uf, bairro, logradouro, numero } = req.body
  try {
    const result = await pool.query(
      `INSERT INTO users (nome, idade, cep, localidade, uf, bairro, logradouro, numero)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [nome, idade, cep, localidade, uf, bairro, logradouro, numero]
    )
    rep.code(201).send(result.rows[0])
  } catch (err) {
    api.log.error(err)
    rep.code(500).send({ error: 'Erro ao criar usuário' })
  }
})

api.put('/users/:id', async (req, rep) => {
  const { id } = req.params
  const { nome, idade, cep, localidade, uf, bairro, logradouro, numero } = req.body

  try {
    const result = await pool.query(
      `UPDATE users SET
         nome = $1, idade = $2, cep = $3, localidade = $4,
         uf = $5, bairro = $6, logradouro = $7, numero = $8
       WHERE id = $9 RETURNING *`,
      [nome, idade, cep, localidade, uf, bairro, logradouro, numero, id]
    )

    if (result.rowCount === 0) {
      rep.code(404).send({ error: 'Usuário não encontrado' })
    } else {
      rep.send(result.rows[0])
    }
  } catch (err) {
    api.log.error(err)
    rep.code(500).send({ error: 'Erro ao atualizar usuário' })
  }
})

api.delete('/users/:id', async (req, rep) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rowCount === 0) {
      rep.code(404).send({ error: 'Usuário não encontrado' })
    } else {
      rep.send({
        message: 'Usuário removido com sucesso',
        usuario: result.rows[0]
      })
    }
  } catch (err) {
    api.log.error(err)
    rep.code(500).send({ error: 'Erro ao deletar usuário' })
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