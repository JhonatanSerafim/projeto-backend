import dotenv from 'dotenv'
import Fastify from 'fastify'
import usersRoutes from './routes/users.routes.js'

dotenv.config()

const api = Fastify({ logger: true })

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
  } catch (err) {
    api.log.error(err)
    process.exit(1)
  }
}
start()
