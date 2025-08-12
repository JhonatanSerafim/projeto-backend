import { getAllUsers, getServerTime } from '../repositories/users.repository.js'

export default async function usersRoutes(api) {
  api.get('/status', async (request, reply) => {
    try {
      const serverTime = await getServerTime()
      reply.send({ serverTime })
    } catch (err) {
      api.log.error(err)
      reply.code(500).send({ error: 'Erro ao conectar ao banco de dados' })
    }
  })

  api.get('/users', async (request, reply) => {
    try {
      const users = await getAllUsers()
      reply.send(users)
    } catch (err) {
      api.log.error(err)
      reply.code(500).send({ error: 'Erro ao buscar usuários' })
    }
  })
}