
# Aula 05 - Organizando o projeto e criando uma arquitetura

## 🎯 Objetivo  
Organizar o projeto em pastas, separar a estrutura e proteger dados sensíveis usando variáveis de ambiente.

---

## 🧱 Passo a Passo

### ✅ Etapa 1 – Proteger os dados de acesso ao Banco de Dados

1. Instalar o dotenv:

```bash
npm install dotenv
```

2. Criar o arquivo `.env` na raiz do projeto (local/dev). Exemplo:

```
DATABASE_URL=postgresql://SEU_USUARIO:SUA_SENHA@host:porta/seu_db
PG_SSL=true
PG_SSL_REJECT_UNAUTHORIZED=true
PORT=3000
NODE_ENV=development
```

> **Importante:** Não comite o arquivo `.env` no repositório!

3. Adicionar `.env` no `.gitignore` para evitar que seja versionado:

```
.env
```

4. Modificar o código para ler as variáveis de ambiente. Exemplo no arquivo principal (`server.js`):

```js
import 'dotenv/config' // carrega o .env automaticamente (ESM)

// Variáveis esperadas
const DATABASE_URL = process.env.DATABASE_URL
const PORT = process.env.PORT || 3000
```

5. Ajustar a função que inicia o servidor para usar as variáveis:

```js
const start = async () => {
  try {
    await api.listen({ port: PORT, host: '0.0.0.0' })
    api.log.info(`Servidor rodando na porta ${PORT}`)
  } catch (err) {
    api.log.error(err)
    process.exit(1)
  }
}
```

6. Validar se as variáveis essenciais estão definidas (falha rápida em caso contrário):

```js
const requireEnv = (key) => {
  const val = process.env[key]
  if (!val) {
    console.error(`Faltando variável de ambiente: ${key}`)
    process.exit(1)
  }
  return val
}
```

---

### ✅ Etapa 2 – Criar a estrutura de pastas do projeto

Dentro da pasta `src`, crie as seguintes pastas:

```
src/
  ├── routes/
  ├── repositories/
  └── infra/
```

- **routes/** — Arquivos que definem as rotas HTTP e seus handlers.  
- **repositories/** — Funções que fazem queries no banco de dados (lógica de acesso a dados).  
- **infra/** — Configurações da infraestrutura, como conexão com banco, serviços externos, middlewares, etc.

---

### ✅ Exemplo de arquivo na pasta `infra`

`src/infra/db.js`

```js
import pkg from 'pg'
const { Pool } = pkg

const DATABASE_URL = process.env.DATABASE_URL

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: process.env.PG_SSL_REJECT_UNAUTHORIZED === 'true'
  }
})

export default pool
```

---

### ✅ Etapa 3 – Organizar código em camadas (repository, routes e server)

#### 3.1 - Repository: `src/repositories/users.repository.js`

```js
import pool from '../infra/db.js'

export async function getAllUsers() {
  const result = await pool.query('SELECT * FROM users')
  return result.rows
}

export async function getServerTime() {
  const result = await pool.query('SELECT NOW()')
  return result.rows[0].now
}
```

#### 3.2 - Routes: `src/routes/users.routes.js`

```js
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
```

#### 3.3 - Server: `src/server.js`

```js
import Fastify from 'fastify'
import dotenv from 'dotenv'
import usersRoutes from './routes/users.routes.js'

dotenv.config()

const api = Fastify({ logger: true })

api.get('/', async (request, reply) => {
  reply.send({ hello: 'world' })
})

await api.register(usersRoutes)

const start = async () => {
  try {
    await api.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' })
  } catch (err) {
    api.log.error(err)
    process.exit(1)
  }
}

start()
```

---

### ✅ Benefícios dessa estrutura

- Manutenção facilitada: cada parte do código tem sua responsabilidade clara.  
- Escalabilidade: fácil adicionar novos recursos (produtos, eventos, etc.).  
- Reutilização: lógica de banco centralizada nos repositórios.

---

## 📋 Resumo da Aula

- Protegemos dados sensíveis usando variáveis de ambiente com `dotenv`  
- Criamos uma estrutura modularizada com pastas para rotas, repositórios e infraestrutura  
- Implementamos funções para acessar o banco no repositório e rotas limpas que reutilizam essa lógica  
- Aprendemos a iniciar o servidor com configuração dinâmica da porta e tratamento básico de erros

---

## ⏭️ Próxima Aula

Conectaremos nosso backend com o frontend para criar uma aplicação completa.
