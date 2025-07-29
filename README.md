# Aula 03 - Conectando Fastify com o Banco de Dados Neon (PostgreSQL)
## 🎯 Objetivo
Nesta aula, vamos aprender a conectar um servidor Fastify ao banco de dados PostgreSQL utilizando o serviço Neon. Vamos instalar a biblioteca `pg`, configurar uma conexão segura com SSL e criar rotas que testam o servidor, a conexão e a listagem de dados no banco.

## 🧱 Passo a Passo
### 1. Instalar o Cliente PostgreSQL
No terminal, instale o pacote:

```txt
npm install pg
```

### 2. Estrutura do Projeto

Organização sugerida do projeto:

```
projeto-backend/
├── node_modules/
├── package.json
└── srv/
    └── server.js

```
> Observe que a estrutura continua a mesma.

### 3. Código do Servidor com Conexão ao Banco
Arquivo: `srv/server.js`

```js
import Fastify from 'fastify'
import pkg from 'pg'
const { Pool } = pkg

const api = Fastify({
  logger: true
})

// Substitua pelo link completo gerado no painel do Neon
const pool = new Pool({
  connectionString: 'postgresql://USUARIO:SENHA@HOST/DATABASE?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
})

// Rota raiz - apenas para testar o servidor
api.get('/', async (request, reply) => {
  reply.send({ message: 'Servidor funcionando!' })
})

// Rota de status - verifica a conexão com o banco
api.get('/status', async (request, reply) => {
  try {
    const result = await pool.query('SELECT NOW()')
    reply.send({ serverTime: result.rows[0].now })
  } catch (err) {
    api.log.error(err)
    reply.code(500).send({ error: 'Erro ao conectar ao banco de dados' })
  }
})

// Rota de listagem de usuários
api.get('/users', async (request, reply) => {
  try {
    const result = await pool.query('SELECT * FROM users')
    reply.send(result.rows)
  } catch (err) {
    api.log.error(err)
    reply.code(500).send({ error: 'Erro ao buscar usuários no banco de dados' })
  }
})

// Inicialização do servidor
const start = async () => {
  try {
    await api.listen({ port: 3000 })
    console.log('Servidor rodando em http://localhost:3000')
  } catch (err) {
    api.log.error(err)
    process.exit(1)
  }
}

start()
```

> 💡 Dica: Use a string de conexão fornecida pelo Neon com sslmode=require para evitar erros de certificado.

### ✅ 4. Testando
Execute o servidor com:

```
node srv/server.js
```

Acesse no navegador:

http://localhost:3000

Resposta esperada:

```json
{
  "serverTime": "2025-07-29T13:00:00.000Z"
}

```
Código do servidor – srv/server.js:

## 📌 Dicas

- O Neon exige conexões SSL, por isso usamos ssl: { rejectUnauthorized: false }.
- A classe Pool gerencia múltiplas conexões ao banco de forma eficiente.
- Você pode criar outras rotas como /insert, /update ou /delete para interações completas com o banco de dados.

## 📋 Resumo da Aula

- Instalamos a biblioteca `pg` para conectar ao PostgreSQL.
- Inserimos a string de conexão segura do Neon.
- Criamos três rotas principais:
- `/`: Testa se o servidor está ativo.
- `/status`: Testa a conexão com o banco.
- `/users`: Retorna os usuários cadastrados.
- Rodamos e testamos a API localmente via navegador ou ferramentas como Postman.

## ⏭️ Próxima Aula
Criando rotas de CRUD com Fastify e PostgreSQL (INSERT, SELECT, UPDATE, DELETE)