import Fastify from 'fastify'

const api = Fastify({
  logger: true
})

const users = [
  {
    id: 1,
    nome: 'Ana Souza',
    idade: 28,
    cep: '01001-000',
    localidade: 'São Paulo',
    uf: 'SP',
    bairro: 'Sé',
    logradouro: 'Praça da Sé',
    numero: '100',
    created_at: new Date()
  },
  {
    id: 2,
    nome: 'Carlos Silva',
    idade: 35,
    cep: '20040-002',
    localidade: 'Rio de Janeiro',
    uf: 'RJ',
    bairro: 'Centro',
    logradouro: 'Rua Uruguaiana',
    numero: '55',
    created_at: new Date()
  },
  {
    id: 3,
    nome: 'Mariana Oliveira',
    idade: 22,
    cep: '30130-010',
    localidade: 'Belo Horizonte',
    uf: 'MG',
    bairro: 'Funcionários',
    logradouro: 'Av. Afonso Pena',
    numero: '999',
    created_at: new Date()
  },
  {
    id: 4,
    nome: 'João Pedro',
    idade: 40,
    cep: '70040-010',
    localidade: 'Brasília',
    uf: 'DF',
    bairro: 'Asa Sul',
    logradouro: 'Esplanada dos Ministérios',
    numero: '1',
    created_at: new Date()
  }
]

api.get('/', function (request, reply) {
  reply.send({ hello: 'world' })
})

api.get('/users', function (request, reply) {
  reply.send(users)
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