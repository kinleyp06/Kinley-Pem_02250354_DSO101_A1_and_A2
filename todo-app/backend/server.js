require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Sequelize, DataTypes } = require("sequelize");

const app = express();

app.use(cors());
app.use(express.json());

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    protocol: "postgres",
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

sequelize.authenticate()
.then(() => console.log("PostgreSQL Connected"))
.catch(err => console.log(err));

const Task = sequelize.define("Task", {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

sequelize.sync();

app.get("/", (req, res) => {
    res.send("Backend Running");
});

app.get("/tasks", async (req, res) => {
    const tasks = await Task.findAll();
    res.json(tasks);
});

app.post("/tasks", async (req, res) => {
    const task = await Task.create(req.body);
    res.json(task);
});

app.delete("/tasks/:id", async (req, res) => {
    await Task.destroy({
        where: {
            id: req.params.id
        }
    });

    res.json({ message: "Deleted" });
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});