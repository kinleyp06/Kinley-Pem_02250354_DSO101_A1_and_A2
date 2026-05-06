// frontend/app/page.tsx
// This is the main page of our To-Do app
// It handles displaying, adding, editing, and deleting todos

'use client'

import { useState, useEffect } from 'react'

// Define the shape of a todo item
interface Todo {
  id: number
  task: string
  completed: boolean
}

export default function Home() {
  // Store the list of todos
  const [todos, setTodos] = useState<Todo[]>([])
  // Store the value of the new task input
  const [newTask, setNewTask] = useState('')
  // Store which todo is being edited
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')

  // The backend URL comes from environment variable
  // Locally: http://localhost:5000
  // On Render: https://be-todo.onrender.com
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  // Fetch all todos when the page loads
  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    const res = await fetch(`${API_URL}/todos`)
    const data = await res.json()
    setTodos(data)
  }

  // Add a new todo to the list
  const addTodo = async () => {
    if (!newTask.trim()) return
    await fetch(`${API_URL}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: newTask })
    })
    setNewTask('')
    fetchTodos() // Refresh the list
  }

  // Toggle a todo's completed status
  const toggleTodo = async (todo: Todo) => {
    await fetch(`${API_URL}/todos/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: todo.task, completed: !todo.completed })
    })
    fetchTodos()
  }

  // Save an edited todo
  const saveEdit = async (todo: Todo) => {
    await fetch(`${API_URL}/todos/${todo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task: editText, completed: todo.completed })
    })
    setEditingId(null)
    fetchTodos()
  }

  // Delete a todo
  const deleteTodo = async (id: number) => {
    await fetch(`${API_URL}/todos/${id}`, { method: 'DELETE' })
    fetchTodos()
  }

  return (
    <main className="max-w-xl mx-auto mt-16 p-6">
      <h1 className="text-3xl font-bold mb-6">📝 My To-Do List</h1>

      {/* Add new task */}
      <div className="flex gap-2 mb-6">
        <input
          className="border rounded px-3 py-2 flex-1"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a new task..."
        />
        <button
          onClick={addTodo}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add
        </button>
      </div>

      {/* Todo list */}
      <ul className="space-y-3">
        {todos.map((todo) => (
          <li key={todo.id} className="flex items-center gap-3 border rounded p-3">
            {/* Checkbox to mark complete */}
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo)}
              className="w-5 h-5"
            />

            {/* Editing mode or display mode */}
            {editingId === todo.id ? (
              <input
                className="border rounded px-2 py-1 flex-1"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
            ) : (
              <span className={`flex-1 ${todo.completed ? 'line-through text-gray-400' : ''}`}>
                {todo.task}
              </span>
            )}

            {/* Edit / Save button */}
            {editingId === todo.id ? (
              <button onClick={() => saveEdit(todo)} className="text-green-600 hover:underline text-sm">
                Save
              </button>
            ) : (
              <button
                onClick={() => { setEditingId(todo.id); setEditText(todo.task) }}
                className="text-blue-500 hover:underline text-sm"
              >
                Edit
              </button>
            )}

            {/* Delete button */}
            <button onClick={() => deleteTodo(todo.id)} className="text-red-500 hover:underline text-sm">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}