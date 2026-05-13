const express = require("express");
const cors = require("cors");
const pool = require("./db");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

async function createTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        completed BOOLEAN DEFAULT FALSE
      )
    `);

    console.log("Tasks table ready");
  } catch (err) {
    console.log("TABLE ERROR:", err);
  }
}

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.get("/tasks", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tasks ORDER BY id ASC"
    );

    res.json(result.rows);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.post("/tasks", async (req, res) => {
  try {
    const { title } = req.body;

    const result = await pool.query(
      "INSERT INTO tasks (title) VALUES ($1) RETURNING *",
      [title]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.put("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    const result = await pool.query(
      "UPDATE tasks SET title=$1, completed=$2 WHERE id=$3 RETURNING *",
      [title, completed, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.delete("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM tasks WHERE id=$1",
      [id]
    );

    res.json({
      message: "Task deleted",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

const PORT = process.env.PORT || 5000;

(async () => {
  await createTable();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();