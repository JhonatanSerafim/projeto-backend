
# Aula 06 - Finalizando o Projeto: Conexão Frontend/Backend

## 🎯 Objetivo  
Conectar o frontend com o backend, implementando uma arquitetura limpa e organizada com separação clara de responsabilidades.

---

## 🌐 **Configuração do CORS (Cross-Origin Resource Sharing)**

### **O que é CORS?**
CORS é um mecanismo de segurança que permite que aplicações web em um domínio acessem recursos de outro domínio. É essencial para o desenvolvimento frontend/backend.

### **O que ele soluciona?**
- **Comunicação Frontend/Backend**: Permite que seu frontend (localhost:3001) se comunique com a API (localhost:3000)
- **Desenvolvimento Local**: Resolve erros de "CORS policy" durante o desenvolvimento
- **Segurança**: Controla quais sites podem acessar sua API

### **Configuração Básica (já implementada)**

O CORS já está configurado no projeto! No arquivo `src/server.js`:

```js
import cors from '@fastify/cors'

// Configuração básica do CORS
await api.register(cors, {
  origin: true, // Permite todas as origens (desenvolvimento)
  credentials: true, // Permite cookies e headers de autenticação
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Headers permitidos
})
```

### **Como Funciona**

1. **`origin: true`** - Permite qualquer site acessar sua API (ideal para desenvolvimento)
2. **`credentials: true`** - Permite envio de cookies e headers de autenticação
3. **`methods`** - Define quais métodos HTTP são permitidos
4. **`allowedHeaders`** - Define quais headers podem ser enviados

### **Testando se está funcionando**

Abra o console do navegador e teste:

```javascript
// Teste simples de CORS
fetch('http://localhost:3000/users')
  .then(response => response.json())
  .then(data => console.log('✅ CORS funcionando:', data))
  .catch(error => console.error('❌ Erro CORS:', error))
```

Se não aparecer erro de CORS, está funcionando perfeitamente! 🎉

---

## 🏗️ **Arquitetura do Projeto: Separação de Responsabilidades**

### **Por que separar o código?**

Antes, todo o código estava misturado no `server.js`:
- Rotas HTTP
- Queries do banco de dados
- Lógica de negócio
- Configurações do servidor

**Problemas:**
- Código difícil de manter
- Difícil de testar
- Difícil de reutilizar
- Arquivo muito grande e confuso

### **Solução: Arquitetura em Camadas**

```
src/
  ├── server.js          ← Configuração do servidor e CORS
  ├── routes/            ← Definição das rotas HTTP
  │   └── users.routes.js
  ├── repositories/      ← Acesso ao banco de dados
  │   └── users.repository.js
  └── infra/            ← Configurações de infraestrutura
      └── db.js
```

---

## 🧱 **Passo a Passo da Implementação**

### ✅ **Etapa 1 – Proteger dados sensíveis com variáveis de ambiente**

1. **Instalar o dotenv:**
```bash
npm install dotenv
```

2. **Criar o arquivo `.env` na raiz do projeto:**
```env
DATABASE_URL=postgresql://SEU_USUARIO:SUA_SENHA@host:porta/seu_db
PG_SSL=true
PG_SSL_REJECT_UNAUTHORIZED=true
PORT=3000
NODE_ENV=development
```

> **⚠️ Importante:** Nunca comite o arquivo `.env` no repositório!

3. **Adicionar `.env` no `.gitignore`:**
```
.env
```

4. **Configurar no `server.js`:**
```js
import dotenv from 'dotenv'
dotenv.config()

const PORT = process.env.PORT || 3000
```

---

### ✅ **Etapa 2 – Criar estrutura de pastas organizada**

```
src/
  ├── routes/           ← Rotas HTTP (endpoints da API)
  ├── repositories/     ← Acesso ao banco de dados
  └── infra/           ← Configurações (banco, middlewares, etc.)
```

**Responsabilidades de cada pasta:**
- **`routes/`** → Define como a API responde às requisições HTTP
- **`repositories/`** → Faz as consultas no banco de dados
- **`infra/`** → Configura conexões e serviços externos

---

### ✅ **Etapa 3 – Separar o código em camadas**

#### **3.1 - Repository Layer (Camada de Dados)**

**Arquivo:** `src/repositories/users.repository.js`

**Responsabilidade:** Apenas acessar o banco de dados

```js
import pool from '../infra/db.js'

// Função para buscar todos os usuários
export async function getAllUsers() {
  const result = await pool.query('SELECT * FROM users')
  return result.rows
}

// Função para buscar horário do servidor
export async function getServerTime() {
  const result = await pool.query('SELECT NOW()')
  return result.rows[0].now
}

// Função para criar usuário
export async function createUser(userData) {
  const { nome, idade, cep, localidade, uf, bairro, logradouro, numero } = userData
  const result = await pool.query(
    `INSERT INTO users (nome, idade, cep, localidade, uf, bairro, logradouro, numero)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [nome, idade, cep, localidade, uf, bairro, logradouro, numero]
  )
  return result.rows[0]
}

// Função para atualizar usuário
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

// Função para deletar usuário
export async function deleteUser(id) {
  const result = await pool.query(
    'DELETE FROM users WHERE id = $1 RETURNING *',
    [id]
  )
  return result.rows[0]
}
```

**Vantagens do Repository:**
- ✅ Código reutilizável
- ✅ Fácil de testar
- ✅ Fácil de manter
- ✅ Separação clara de responsabilidades

---

#### **3.2 - Routes Layer (Camada de Rotas)**

**Arquivo:** `src/routes/users.routes.js`

**Responsabilidade:** Definir endpoints HTTP e chamar as funções do repository

```js
import { getAllUsers, getServerTime, createUser, updateUser, deleteUser } from '../repositories/users.repository.js'

export default async function usersRoutes(api) {
  // Rota para verificar status do servidor
  api.get('/status', async (request, reply) => {
    try {
      const serverTime = await getServerTime() // Chama o repository
      reply.send({ serverTime })
    } catch (err) {
      api.log.error(err)
      reply.code(500).send({ error: 'Erro ao conectar ao banco de dados' })
    }
  })

  // Rota para listar usuários
  api.get('/users', async (request, reply) => {
    try {
      const users = await getAllUsers() // Chama o repository
      reply.send(users)
    } catch (err) {
      api.log.error(err)
      reply.code(500).send({ error: 'Erro ao buscar usuários' })
    }
  })

  // Rota para criar usuário
  api.post('/users', async (req, rep) => {
    try {
      const user = await createUser(req.body) // Chama o repository
      rep.code(201).send(user)
    } catch (err) {
      api.log.error(err)
      rep.code(500).send({ error: 'Erro ao criar usuário' })
    }
  })

  // Rota para atualizar usuário
  api.put('/users/:id', async (req, rep) => {
    const { id } = req.params
    try {
      const user = await updateUser(id, req.body) // Chama o repository
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

  // Rota para deletar usuário
  api.delete('/users/:id', async (req, rep) => {
    const { id } = req.params
    try {
      const user = await deleteUser(id) // Chama o repository
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

**Vantagens das Routes:**
- ✅ Apenas definem endpoints HTTP
- ✅ Chamam funções do repository
- ✅ Tratam erros HTTP
- ✅ Não fazem queries no banco

---

#### **3.3 - Server Layer (Camada do Servidor)**

**Arquivo:** `src/server.js`

**Responsabilidade:** Configurar o servidor e registrar as rotas

```js
import dotenv from 'dotenv'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import usersRoutes from './routes/users.routes.js'

dotenv.config()

const api = Fastify({ logger: true })

// Configuração do CORS
await api.register(cors, {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})

const PORT = process.env.PORT || 3000

// Rota raiz
api.get('/', function (request, reply) {
  reply.send({ hello: 'world' })
})

// Registrar as rotas de usuários
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
```

**Vantagens do Server:**
- ✅ Apenas configura o servidor
- ✅ Registra as rotas
- ✅ Configura CORS
- ✅ Inicia o servidor

---

## 🔄 **Fluxo de Dados: Como as Camadas se Comunicam**

```
Frontend (localhost:3001)
        ↓
   Server.js (Porta 3000)
        ↓
   Routes (users.routes.js)
        ↓
Repository (users.repository.js)
        ↓
   Banco de Dados (PostgreSQL)
```

**Exemplo prático - Listar usuários:**

1. **Frontend** faz requisição para `GET /users`
2. **Server.js** recebe e encaminha para as rotas
3. **Routes** chama `getAllUsers()` do repository
4. **Repository** executa `SELECT * FROM users`
5. **Banco** retorna os dados
6. **Repository** retorna para as routes
7. **Routes** retorna para o server
8. **Server** envia resposta para o frontend

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

## ✅ **Benefícios da Arquitetura em Camadas**

### **🔧 Manutenibilidade**
- **Código organizado:** Cada arquivo tem uma responsabilidade específica
- **Fácil de encontrar:** Problemas ficam isolados em uma camada
- **Fácil de corrigir:** Mudanças não afetam outras partes

### **📈 Escalabilidade**
- **Novas funcionalidades:** Fácil adicionar novos endpoints
- **Novos recursos:** Fácil criar novos tipos de dados (produtos, eventos, etc.)
- **Reutilização:** Código pode ser usado em diferentes partes

### **🧪 Testabilidade**
- **Repository:** Pode ser testado independentemente
- **Routes:** Pode ser testado sem banco de dados
- **Server:** Pode ser testado isoladamente

### **👥 Trabalho em Equipe**
- **Desenvolvedores diferentes:** Podem trabalhar em camadas diferentes
- **Conflitos reduzidos:** Menos chance de conflitos no Git
- **Code review:** Mais fácil de revisar código específico

---

## 📋 **Resumo da Aula 06**

### **🎯 O que aprendemos:**

1. **✅ CORS configurado** - Frontend e backend se comunicam perfeitamente
2. **✅ Arquitetura em camadas** - Código organizado e responsabilidades separadas
3. **✅ Repository Pattern** - Acesso ao banco centralizado e reutilizável
4. **✅ Routes organizadas** - Endpoints HTTP limpos e bem estruturados
5. **✅ Server simplificado** - Apenas configuração e inicialização
6. **✅ API documentada** - Todos os endpoints explicados com exemplos
7. **✅ Exemplos frontend** - Código JavaScript para usar a API

### **🏗️ Estrutura final do projeto:**

```
projeto-backend/
├── src/
│   ├── server.js              ← Servidor + CORS + Rotas
│   ├── routes/
│   │   └── users.routes.js    ← Endpoints HTTP
│   ├── repositories/
│   │   └── users.repository.js ← Acesso ao banco
│   └── infra/
│       └── db.js              ← Conexão com banco
├── .env                       ← Variáveis de ambiente
├── .gitignore                 ← Arquivos não versionados
└── README.md                  ← Documentação completa
```

### **🚀 Próximos passos:**

- **Testar a API:** Usar os exemplos do README
- **Conectar frontend:** Implementar as funções JavaScript
- **Adicionar validações:** Verificar dados antes de salvar
- **Implementar autenticação:** Sistema de login/logout
- **Deploy:** Colocar em produção

---

## 🎉 **Projeto Completo!**

Agora você tem um backend completo e organizado que:
- ✅ **Funciona** com CORS configurado
- ✅ **É organizado** em camadas bem definidas
- ✅ **É fácil de manter** e expandir
- ✅ **Tem documentação** clara e exemplos práticos
- ✅ **Está pronto** para conectar com o frontend

**Parabéns! Você criou uma arquitetura profissional! 🚀**
