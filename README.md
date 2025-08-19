
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

export async function createUser(userData) {
  const { nome, idade, cep, localidade, uf, bairro, logradouro, numero } = userData
  const result = await pool.query(
    `INSERT INTO users (nome, idade, cep, localidade, uf, bairro, logradouro, numero)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [nome, idade, cep, localidade, uf, bairro, logradouro, numero]
  )
  return result.rows[0]
}

export async function updateUser(id, userData) {
  const { nome, idade, cep, localidade, uf, bairro, logradouro, numero } = userData
  const result = await pool.query(
    `UPDATE users SET
       nome = $1, idade = $2, cep = $3, localidade = $4,
       uf = $5, bairro = $6, logradouro = $7, numero = $8
     WHERE id = $9 RETURNING *`,
    [nome, idade, cep, localidade, uf, bairro, logradouro, numero, id]
  )
  return result.rows[0]
}

export async function deleteUser(id) {
  const result = await pool.query(
    'DELETE FROM users WHERE id = $1 RETURNING *',
    [id]
  )
  return result.rows[0]
}
```

#### 3.2 - Routes: `src/routes/users.routes.js`

```js
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
```

#### 3.3 - Server: `src/server.js`

```js
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
```

---

## 🚀 **Documentação da API - Endpoints Disponíveis**

### **Base URL:** `http://localhost:3000`

---

### **1. Status do Servidor**
- **GET** `/status`
- **Descrição:** Verifica se o servidor e banco de dados estão funcionando
- **Resposta de Sucesso:**
```json
{
  "serverTime": "2024-01-18T10:30:45.123Z"
}
```

---

### **2. Listar Usuários**
- **GET** `/users`
- **Descrição:** Retorna todos os usuários cadastrados
- **Resposta de Sucesso:**
```json
[
  {
    "id": 1,
    "nome": "João Silva",
    "idade": 25,
    "cep": "12345-678",
    "localidade": "São Paulo",
    "uf": "SP",
    "bairro": "Centro",
    "logradouro": "Rua das Flores",
    "numero": "123"
  }
]
```

---

### **3. Criar Usuário**
- **POST** `/users`
- **Descrição:** Cadastra um novo usuário
- **Body (JSON):**
```json
{
  "nome": "Maria Santos",
  "idade": 30,
  "cep": "98765-432",
  "localidade": "Rio de Janeiro",
  "uf": "RJ",
  "bairro": "Copacabana",
  "logradouro": "Avenida Atlântica",
  "numero": "456"
}
```
- **Resposta de Sucesso (201):**
```json
{
  "id": 2,
  "nome": "Maria Santos",
  "idade": 30,
  "cep": "98765-432",
  "localidade": "Rio de Janeiro",
  "uf": "RJ",
  "bairro": "Copacabana",
  "logradouro": "Avenida Atlântica",
  "numero": "456"
}
```

---

### **4. Atualizar Usuário**
- **PUT** `/users/:id`
- **Descrição:** Atualiza dados de um usuário existente
- **Parâmetros:** `id` (ID do usuário na URL)
- **Body (JSON):**
```json
{
  "nome": "Maria Santos Silva",
  "idade": 31,
  "cep": "98765-432",
  "localidade": "Rio de Janeiro",
  "uf": "RJ",
  "bairro": "Copacabana",
  "logradouro": "Avenida Atlântica",
  "numero": "789"
}
```
- **Resposta de Sucesso (200):**
```json
{
  "id": 2,
  "nome": "Maria Santos Silva",
  "idade": 31,
  "cep": "98765-432",
  "localidade": "Rio de Janeiro",
  "uf": "RJ",
  "bairro": "Copacabana",
  "logradouro": "Avenida Atlântica",
  "numero": "789"
}
```

---

### **5. Deletar Usuário**
- **DELETE** `/users/:id`
- **Descrição:** Remove um usuário do sistema
- **Parâmetros:** `id` (ID do usuário na URL)
- **Resposta de Sucesso (200):**
```json
{
  "message": "Usuário removido com sucesso",
  "usuario": {
    "id": 2,
    "nome": "Maria Santos Silva",
    "idade": 31,
    "cep": "98765-432",
    "localidade": "Rio de Janeiro",
    "uf": "RJ",
    "bairro": "Copacabana",
    "logradouro": "Avenida Atlântica",
    "numero": "789"
  }
}
```

---

## 💻 **Exemplos de Uso no Frontend**

### **1. Verificar Status do Servidor**

```javascript
// Verificar se o servidor está funcionando
async function checkServerStatus() {
  try {
    const response = await fetch('http://localhost:3000/status')
    const data = await response.json()
    console.log('Servidor funcionando:', data.serverTime)
  } catch (error) {
    console.error('Erro ao conectar com o servidor:', error)
  }
}

checkServerStatus()
```

### **2. Listar Usuários**

```javascript
// Buscar todos os usuários
async function getUsers() {
  try {
    const response = await fetch('http://localhost:3000/users')
    const users = await response.json()
    
    // Exibir na tela
    const userList = document.getElementById('userList')
    userList.innerHTML = users.map(user => `
      <div class="user-card">
        <h3>${user.nome}</h3>
        <p>Idade: ${user.idade}</p>
        <p>Endereço: ${user.logradouro}, ${user.numero}</p>
        <p>${user.bairro}, ${user.localidade} - ${user.uf}</p>
        <p>CEP: ${user.cep}</p>
        <button onclick="editUser(${user.id})">Editar</button>
        <button onclick="deleteUser(${user.id})">Excluir</button>
      </div>
    `).join('')
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
  }
}

getUsers()
```

### **3. Criar Usuário**

```javascript
// Formulário para criar usuário
async function createUser(event) {
  event.preventDefault()
  
  const formData = new FormData(event.target)
  const userData = {
    nome: formData.get('nome'),
    idade: parseInt(formData.get('idade')),
    cep: formData.get('cep'),
    localidade: formData.get('localidade'),
    uf: formData.get('uf'),
    bairro: formData.get('bairro'),
    logradouro: formData.get('logradouro'),
    numero: formData.get('numero')
  }
  
  try {
    const response = await fetch('http://localhost:3000/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })
    
    if (response.ok) {
      const newUser = await response.json()
      console.log('Usuário criado:', newUser)
      event.target.reset()
      getUsers() // Atualizar lista
    } else {
      console.error('Erro ao criar usuário')
    }
  } catch (error) {
    console.error('Erro na requisição:', error)
  }
}

// HTML do formulário
document.getElementById('createUserForm').addEventListener('submit', createUser)
```

### **4. Atualizar Usuário**

```javascript
// Atualizar usuário existente
async function updateUser(id, userData) {
  try {
    const response = await fetch(`http://localhost:3000/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })
    
    if (response.ok) {
      const updatedUser = await response.json()
      console.log('Usuário atualizado:', updatedUser)
      getUsers() // Atualizar lista
    } else if (response.status === 404) {
      console.error('Usuário não encontrado')
    } else {
      console.error('Erro ao atualizar usuário')
    }
  } catch (error) {
    console.error('Erro na requisição:', error)
  }
}

// Exemplo de uso
function editUser(id) {
  // Preencher formulário com dados do usuário
  // ... código para preencher formulário ...
  
  // Ao submeter o formulário
  const updatedData = {
    nome: document.getElementById('nome').value,
    idade: parseInt(document.getElementById('idade').value),
    // ... outros campos ...
  }
  
  updateUser(id, updatedData)
}
```

### **5. Deletar Usuário**

```javascript
// Deletar usuário
async function deleteUser(id) {
  if (!confirm('Tem certeza que deseja excluir este usuário?')) {
    return
  }
  
  try {
    const response = await fetch(`http://localhost:3000/users/${id}`, {
      method: 'DELETE'
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log(result.message)
      getUsers() // Atualizar lista
    } else if (response.status === 404) {
      console.error('Usuário não encontrado')
    } else {
      console.error('Erro ao deletar usuário')
    }
  } catch (error) {
    console.error('Erro na requisição:', error)
  }
}
```

### **6. HTML Completo de Exemplo**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gerenciador de Usuários</title>
    <style>
        .user-card {
            border: 1px solid #ddd;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
        }
        .form-group {
            margin: 10px 0;
        }
        label {
            display: inline-block;
            width: 100px;
        }
    </style>
</head>
<body>
    <h1>Gerenciador de Usuários</h1>
    
    <!-- Formulário para criar usuário -->
    <h2>Criar Novo Usuário</h2>
    <form id="createUserForm">
        <div class="form-group">
            <label>Nome:</label>
            <input type="text" name="nome" required>
        </div>
        <div class="form-group">
            <label>Idade:</label>
            <input type="number" name="idade" required>
        </div>
        <div class="form-group">
            <label>CEP:</label>
            <input type="text" name="cep" required>
        </div>
        <div class="form-group">
            <label>Localidade:</label>
            <input type="text" name="localidade" required>
        </div>
        <div class="form-group">
            <label>UF:</label>
            <input type="text" name="uf" maxlength="2" required>
        </div>
        <div class="form-group">
            <label>Bairro:</label>
            <input type="text" name="bairro" required>
        </div>
        <div class="form-group">
            <label>Logradouro:</label>
            <input type="text" name="logradouro" required>
        </div>
        <div class="form-group">
            <label>Número:</label>
            <input type="text" name="numero" required>
        </div>
        <button type="submit">Criar Usuário</button>
    </form>
    
    <!-- Lista de usuários -->
    <h2>Usuários Cadastrados</h2>
    <div id="userList"></div>
    
    <script>
        // Incluir aqui todos os códigos JavaScript dos exemplos acima
        // checkServerStatus()
        // getUsers()
        // createUser()
        // updateUser()
        // deleteUser()
    </script>
</body>
</html>
```

---

## ✅ **Benefícios dessa estrutura**

- Manutenção facilitada: cada parte do código tem sua responsabilidade clara.  
- Escalabilidade: fácil adicionar novos recursos (produtos, eventos, etc.).  
- Reutilização: lógica de banco centralizada nos repositórios.
- API bem documentada e fácil de usar no frontend.

---

## 📋 Resumo da Aula

- Protegemos dados sensíveis usando variáveis de ambiente com `dotenv`  
- Criamos uma estrutura modularizada com pastas para rotas, repositórios e infraestrutura  
- Implementamos funções para acessar o banco no repositório e rotas limpas que reutilizam essa lógica  
- Aprendemos a iniciar o servidor com configuração dinâmica da porta e tratamento básico de erros
- Documentamos todas as rotas da API com exemplos práticos de uso no frontend

---

## ⏭️ Próxima Aula

Conectaremos nosso backend com o frontend para criar uma aplicação completa.
