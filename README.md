# Aula 2 - Criando e Configurando o Banco de Dados com Neon + PostgreSQL

## 🎯 Objetivo  
Nesta aula, vamos criar uma conta gratuita na plataforma **Neon.tech**, configurar um banco de dados PostgreSQL e criar a tabela `users` que será utilizada na nossa API.

---

## 🧱 Passo a Passo

### 1. Acessando o Neon.tech

Acesse o site oficial do Neon:  
🔗 [https://neon.tech](https://neon.tech)

Clique em **"Start for free"** ou **"Sign Up"** para criar sua conta.

---

### 2. Criando o Projeto e o Banco de Dados

Após o login:

- Clique em **"New Project"**
- Nome do banco: `lista-usuarios`
- Tipo: **PostgreSQL**
- Região: `sa-east-1` (para América do Sul)
- Clique em **"Create Project"**

---

### 3. Visualizando a Connection String

Após a criação:

- Vá na aba **"Connection Details"**
- Copie a **Connection String**.  
Exemplo:

postgresql://usuario:senha@ep-seuprojeto.sa-east-1.aws.neon.tech/lista-usuarios?sslmode=require

### 4. Acessando o Editor SQL

No painel do Neon:

- Acesse a aba **"SQL Editor"**
- Aqui você poderá executar comandos SQL diretamente

---

### 5. Criando a Tabela `users`

Cole o seguinte SQL no editor e execute:

```sql
CREATE TABLE users (
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
### 6. Inserindo um Registro de Teste
```sql
INSERT INTO users (nome, idade, cep, localidade, uf, bairro, logradouro, numero)
VALUES ('João Silva', 30, '12345-678', 'São Paulo', 'SP', 'Centro', 'Rua das Flores', '123');
```
## 7. Consultando os Dados

SELECT * FROM users;

## 8. Deletando Dados
Deletar usuário por ID:


DELETE FROM users WHERE id = 2;

#### Deletar todos os registros:


DELETE FROM users;

> ⚠️ Atenção: o segundo comando apaga todos os dados da tabela.

## 📌 Dicas Extras
Adicione ?sslmode=require&channel_binding=require na connection string para usar com Node.js.

Campos VARCHAR permitem armazenar textos curtos (como nome, cidade, etc.).

O campo created_at é preenchido automaticamente com a data/hora da inserção.

## 📋 Resumo da Aula
- Criamos uma conta gratuita no Neon.tech
- Provisionamos um banco PostgreSQL chamado lista-usuarios
- Criamos a tabela users via SQL
- Inserimos e consultamos registros
- Aprendemos comandos SQL básicos como INSERT, SELECT e DELETE

## 💡 Desafio
Crie um segundo registro de usuário com dados fictícios e consulte com:

SELECT * FROM users;
