const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const { sequelize, User } = require("./model/User");

const app = express();
app.use(bodyParser.json());
const db = new sqlite3.Database("./db.sqlite");

// ENDPOINT 1 - Vulnerável (WHERE Injection)
app.post("/vulnerable", (req, res) => {
  const { cpf, password } = req.body;
  const query = `SELECT * FROM users WHERE cpf = '${cpf}' AND password = '${password}'`;
  db.all(query, (err, rows) => {
    if (rows.length > 0) {
      res.send("✅ Logado com sucesso");
    } else {
      res.status(401).send("❌ Dados inválidos");
    }
  });
});

// ENDPOINT 2 - Validação no front-end (mas backend vulnerável)
app.post("/frontend-validation", (req, res) => {
  const { cpf, password } = req.body;
  const query = `SELECT * FROM users WHERE cpf = '${cpf}' AND password = '${password}'`;
  db.all(query, (err, rows) => {
    if (rows.length > 0) {
      res.send("✅ Logado com sucesso");
    } else {
      res.status(401).send("❌ Dados inválidos");
    }
  });
});

// ENDPOINT 3 - Validação no backend
app.post("/backend-validation", (req, res) => {
  const { cpf, password } = req.body;
  if (
    typeof cpf !== "string" ||
    typeof password !== "string" ||
    cpf.includes("'") ||
    password.includes("'")
  ) {
    return res.status(400).send("❌ Entrada inválida");
  }
  const query = `SELECT * FROM users WHERE cpf = '${cpf}' AND password = '${password}'`;
  db.all(query, (err, rows) => {
    if (rows.length > 0) {
      res.send("✅ Logado com sucesso");
    } else {
      res.status(401).send("❌ Dados inválidos");
    }
  });
});

// ENDPOINT 4 - Protegido com ORM
app.post("/orm-protection", async (req, res) => {
  const { cpf, password } = req.body;
  try {
    const user = await User.findOne({ where: { cpf, password } });
    if (user) {
      res.send("✅ Logado com sucesso");
    } else {
      res.status(401).send("❌ Dados inválidos");
    }
  } catch (err) {
    res.status(500).send("❌ Erro no servidor");
  }
});

// ========== ENDPOINTS ADICIONAIS COM SQL INJECTION ==========

// CREATE - Vulnerável // Resultado: A tabela users seria excluída!
app.post("/vulnerable-create", (req, res) => {
  const { cpf, password } = req.body;
  const query = `INSERT INTO users (cpf, password) VALUES ('${cpf}', '${password}')`;
  db.run(query, function (err) {
    if (err) return res.status(500).send("❌ Erro ao criar usuário");
    res.send(`✅ Usuário criado com ID ${this.lastID}`);
  });
});

// UPDATE - Vulnerável
app.put("/vulnerable-update", (req, res) => {
  const { cpf, newPassword } = req.body;
  const query = `UPDATE users SET password = '${newPassword}' WHERE cpf = '${cpf}'`;
  db.run(query, function (err) {
    if (err) return res.status(500).send("❌ Erro ao atualizar senha");
    if (this.changes === 0)
      return res.status(404).send("❌ Usuário não encontrado");
    res.send("✅ Senha atualizada com sucesso");
  });
});

// DELETE - Vulnerável
app.delete("/vulnerable-delete", (req, res) => {
  const { cpf } = req.body;
  const query = `DELETE FROM users WHERE cpf = '${cpf}'`;
  db.run(query, function (err) {
    if (err) return res.status(500).send("❌ Erro ao deletar usuário");
    if (this.changes === 0)
      return res.status(404).send("❌ Usuário não encontrado");
    res.send("✅ Usuário deletado com sucesso");
  });
});

app.listen(3000, async () => {
  await sequelize.authenticate();
  console.log("🚀 Server rodando em http://localhost:3000");
});
