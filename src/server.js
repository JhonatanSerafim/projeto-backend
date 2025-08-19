import dotenv from 'dotenv'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import usersRoutes from './routes/users.routes.js'

dotenv.config()

const api = Fastify({ logger: true })

// Configuração básica do CORS
await api.register(cors, {
  origin: true, // Permite todas as origens (desenvolvimento)
  credentials: true, // Permite cookies e headers de autenticação
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Headers permitidos
})

const PORT = process.env.PORT || 3000

api.get('/', function (request, reply) {
  reply.send({ hello: 'world' })
})

await api.register(usersRoutes)

// Iniciar servidor
const start = async () => {
  try {
    await api.listen({ port: PORT, host: '0.0.0.0' })
    api.log.info(`Servidor rodando na porta ${PORT}`)
    api.log.info('✅ CORS configurado e funcionando!')
  } catch (err) {
    api.log.error(err)
    process.exit(1)
  }
}
start()
