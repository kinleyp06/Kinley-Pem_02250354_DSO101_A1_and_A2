import React, { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.REACT_APP_API_URL;

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API}/tasks`);
      setTasks(res.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async () => {
    if (!title.trim()) return;

    try {
      if (editingId !== null) {
        const oldTask = tasks.find(
          (t) => Number(t.id) === Number(editingId)
        );

        await axios.put(`${API}/tasks/${editingId}`, {
          title,
          completed: oldTask.completed,
        });

        setEditingId(null);
      } else {
        await axios.post(`${API}/tasks`, { title });
      }

      setTitle("");
      fetchTasks();
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleEdit = (task) => {
    setTitle(task.title);
    setEditingId(Number(task.id));
  };

  const handleToggle = async (task) => {
    try {
      await axios.put(`${API}/tasks/${task.id}`, {
        title: task.title,
        completed: !task.completed,
      });

      fetchTasks();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        fontFamily: "Arial",
      }}
    >
      <h1>To-Do List</h1>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Enter task"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            flex: 1,
            padding: "10px",
          }}
        />

        <button onClick={handleSubmit}>
          {editingId !== null ? "Update" : "Add"}
        </button>
      </div>

      {tasks.map((task) => (
        <div
          key={Number(task.id)}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px",
            border: "1px solid #ccc",
            marginBottom: "10px",
          }}
        >
          <span
            onClick={() => handleToggle(task)}
            style={{
              cursor: "pointer",
              textDecoration: task.completed
                ? "line-through"
                : "none",
            }}
          >
            {task.title}
          </span>

          <div
            style={{
              display: "flex",
              gap: "10px",
            }}
          >
            <button onClick={() => handleEdit(task)}>
              Edit
            </button>

            <button onClick={() => handleDelete(task.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;