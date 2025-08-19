import { getAllUsers, getServerTime, createUser, updateUser, deleteUser } from '../repositories/users.repository.js'

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

  api.post('/users', async (req, rep) => {
    try {
      const user = await createUser(req.body)
      rep.code(201).send(user)
    } catch (err) {
      api.log.error(err)
      rep.code(500).send({ error: 'Erro ao criar usuário' })
    }
  })

  api.put('/users/:id', async (req, rep) => {
    const { id } = req.params
    try {
      const user = await updateUser(id, req.body)
      if (!user) {
        rep.code(404).send({ error: 'Usuário não encontrado' })
      } else {
        rep.send(user)
      }
    } catch (err) {
      api.log.error(err)
      rep.code(500).send({ error: 'Erro ao atualizar usuário' })
    }
  })

  api.delete('/users/:id', async (req, rep) => {
    const { id } = req.params
    try {
      const user = await deleteUser(id)
      if (!user) {
        rep.code(404).send({ error: 'Usuário não encontrado' })
      } else {
        rep.send({
          message: 'Usuário removido com sucesso',
          usuario: user
        })
      }
    } catch (err) {
      api.log.error(err)
      rep.code(500).send({ error: 'Erro ao deletar usuário' })
    }
  })
}