// backend/server.js
// This is the main entry point for our Hono backend server
// It handles all CRUD operations for the to-do list

import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import pkg from 'pg'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

const { Pool } = pkg

// Create a connection pool to PostgreSQL using env variables
// These values come from .env file locally, or from Render's dashboard in production
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

const app = new Hono()

// Allow requests from our frontend (CORS)
app.use('/*', cors())

// Create the todos table if it doesn't exist yet
// This runs once when the server starts
const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
      id SERIAL PRIMARY KEY,
      task TEXT NOT NULL,
      completed BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `)
  console.log('Database initialized')
}

// GET /todos - Fetch all todos
app.get('/todos', async (c) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY created_at DESC')
    return c.json(result.rows)
  } catch (err) {
    return c.json({ error: 'Failed to fetch todos' }, 500)
  }
})

// POST /todos - Create a new todo
app.post('/todos', async (c) => {
  try {
    const { task } = await c.req.json()
    const result = await pool.query(
      'INSERT INTO todos (task) VALUES ($1) RETURNING *',
      [task]
    )
    return c.json(result.rows[0], 201)
  } catch (err) {
    return c.json({ error: 'Failed to create todo' }, 500)
  }
})

// PUT /todos/:id - Update a todo (mark complete or edit text)
app.put('/todos/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { task, completed } = await c.req.json()
    const result = await pool.query(
      'UPDATE todos SET task = $1, completed = $2 WHERE id = $3 RETURNING *',
      [task, completed, id]
    )
    return c.json(result.rows[0])
  } catch (err) {
    return c.json({ error: 'Failed to update todo' }, 500)
  }
})

// DELETE /todos/:id - Delete a todo
app.delete('/todos/:id', async (c) => {
  try {
    const id = c.req.param('id')
    await pool.query('DELETE FROM todos WHERE id = $1', [id])
    return c.json({ message: 'Todo deleted' })
  } catch (err) {
    return c.json({ error: 'Failed to delete todo' }, 500)
  }
})

// Health check endpoint - useful to verify the server is running
app.get('/', (c) => c.json({ status: 'Backend is running!' }))

// Initialize database then start server
const port = parseInt(process.env.PORT) || 5000
initDB().then(() => {
  serve({ fetch: app.fetch, port })
  console.log(`Server running on port ${port}`)
})

export default app