// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Sequelize, DataTypes } = require("sequelize");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection using individual env variables
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      connectTimeout: 10000,
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
);

// Test database connection with retry
let retries = 0;
const connectDB = async () => {
  try {
    console.log("Connecting to:", process.env.DB_HOST);
    console.log("Database:", process.env.DB_NAME);
    console.log("User:", process.env.DB_USER);

    await sequelize.authenticate();
    console.log("✓ PostgreSQL Connected");
    await sequelize.sync();
    console.log("✓ Database synced");
  } catch (err) {
    retries++;
    console.error(
      `✗ Database connection error (attempt ${retries}): ${err.message}`,
    );
    console.error("Full error:", err);
    if (retries < 3) {
      console.log("Retrying in 5 seconds...");
      setTimeout(connectDB, 5000);
    } else {
      console.error("Failed to connect after 3 attempts");
    }
  }
};

connectDB();

// Define Task Model
const Task = sequelize.define(
  "Task",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "tasks",
    timestamps: true,
  },
);

// Root endpoint
app.get("/", (req, res) => {
  res.send("Backend Running");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
