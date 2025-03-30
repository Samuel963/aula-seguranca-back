const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./db.sqlite');

db.serialize(() => {
  db.run('DROP TABLE IF EXISTS users');
  db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cpf TEXT NOT NULL,
      password TEXT NOT NULL
    )
  `);

  const stmt = db.prepare('INSERT INTO users (cpf, password) VALUES (?, ?)');
  stmt.run('12345678900', 'senha123');
  stmt.run('98765432100', '1234');
  stmt.finalize();

  console.log('Banco criado e populado!');
});

db.close();