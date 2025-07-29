import Fastify from 'fastify'

const api = Fastify({
  logger: true
})

api.get('/', function (request, reply) {
  reply.send({ hello: 'world' })
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