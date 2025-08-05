# Aula 03 - Criando um CRUD com Fastify + Neon (PostgreSQL)

## 🎯 Objetivo
Implementar as 4 operações básicas de um CRUD (Create, Read, Update e Delete) utilizando o servidor Fastify integrado ao banco de dados PostgreSQL hospedado no Neon. Também abordaremos os conceitos de `RETURNING` e proteção contra `SQL Injection`.

## 🧱 Passo a Passo

### ✅ Etapa 1 – Preparar o banco de dados no Neon

🔹 Acesse o Neon: https://neon.tech e entre com sua conta.

Crie um novo projeto (caso ainda não tenha feito).

🔹 Crie a tabela `users` no SQL Editor com o seguinte comando:

```sql
CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL,
  idade INTEGER NOT NULL,
  cep VARCHAR(9) NOT NULL,
  localidade VARCHAR(100) NOT NULL,
  uf VARCHAR(2) NOT NULL,
  bairro VARCHAR(30) NOT NULL,
  logradouro VARCHAR(100) NOT NULL,
  numero VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

> 📌 Isso cria uma tabela com ID auto-incremental. (Feito na aula 02)

---

### ✅ Etapa 2 – Criar rota de listagem (READ)

```js
api.get('/users', async (req, rep) => {
  try {
    const result = await pool.query('SELECT * FROM users')
    rep.send(result.rows)
  } catch (err) {
    api.log.error(err)
    rep.code(500).send({ error: 'Erro ao buscar usuários' })
  }
})
```

> 📍 Testar com: navegador ou Postman → `GET http://localhost:3000/users` (Feito na aula 03)

---

### ✅ Etapa 3 – Criar rota de criação de novo usuário (POST)

Arquivo: `srv/server.js`

```js
api.post('/users', async (req, rep) => {
  const { nome, idade, cep, localidade, uf, bairro, logradouro, numero } = req.body
  try {
    const result = await pool.query(
      `INSERT INTO users (nome, idade, cep, localidade, uf, bairro, logradouro, numero)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [nome, idade, cep, localidade, uf, bairro, logradouro, numero]
    )
    rep.code(201).send(result.rows[0])
  } catch (err) {
    api.log.error(err)
    rep.code(500).send({ error: 'Erro ao criar usuário' })
  }
})
```

Teste no Postman com método `POST`:

- URL: `http://localhost:3000/users`
- Body (JSON):

```json
{
  "nome": "João",
  "idade": 30,
  "cep": "12345-678",
  "localidade": "São Paulo",
  "uf": "SP",
  "bairro": "Centro",
  "logradouro": "Rua das Flores",
  "numero": "123"
}
```

#### Por que usar `RETURNING *`?
- Para retornar os dados do novo usuário inserido no banco.

#### Por que usar `$1`, `$2`, etc.?
- Para proteger contra SQL Injection.

---

### ✅ Etapa 4 – Criar rota de atualização de usuário (PUT)

```js
api.put('/users/:id', async (req, rep) => {
  const { id } = req.params
  const { nome, idade, cep, localidade, uf, bairro, logradouro, numero } = req.body

  try {
    const result = await pool.query(
      `UPDATE users SET
         nome = $1, idade = $2, cep = $3, localidade = $4,
         uf = $5, bairro = $6, logradouro = $7, numero = $8
       WHERE id = $9 RETURNING *`,
      [nome, idade, cep, localidade, uf, bairro, logradouro, numero, id]
    )

    if (result.rowCount === 0) {
      rep.code(404).send({ error: 'Usuário não encontrado' })
    } else {
      rep.send(result.rows[0])
    }
  } catch (err) {
    api.log.error(err)
    rep.code(500).send({ error: 'Erro ao atualizar usuário' })
  }
})
```

Teste com:

- Método: `PUT`
- URL: `http://localhost:3000/users/1`
- Body (JSON):

```json
{
  "nome": "João Atualizado",
  "idade": 31,
  "cep": "98765-432",
  "localidade": "Rio de Janeiro",
  "uf": "RJ",
  "bairro": "Copacabana",
  "logradouro": "Avenida Atlântica",
  "numero": "456"
}
```

> Essa rota atualiza os dados do usuário e retorna o novo objeto.

---

### ✅ Etapa 5 – Criar rota para deletar usuário (DELETE)

```js
api.delete('/users/:id', async (req, rep) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rowCount === 0) {
      rep.code(404).send({ error: 'Usuário não encontrado' })
    } else {
      rep.send({
        message: 'Usuário removido com sucesso',
        usuario: result.rows[0]
      })
    }
  } catch (err) {
    api.log.error(err)
    rep.code(500).send({ error: 'Erro ao deletar usuário' })
  }
})
```

Teste com:

- Método: `DELETE`
- URL: `http://localhost:3000/users/1`

---

## 📋 Resumo da Aula

- Criamos todas as operações do CRUD (Create, Read, Update, Delete)
- Utilizamos SQL parametrizado para evitar SQL Injection
- Usamos `RETURNING *` para obter os dados inseridos, atualizados ou deletados

## ⏭️ Próxima Aula

Organização do projeto com MVC, uso do `.env` para variáveis de ambiente e separação do banco em arquivo `.db`.