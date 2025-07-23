const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URI = "mongodb+srv://frzzz25:00000000@cluster0.mongodb.net/?retryWrites=true&w=majority";
const DB_NAME = "esp32_logs";

let db, ledState = { blue: "off", white: "off", green: "off" };

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

MongoClient.connect(MONGO_URI).then(client => {
  db = client.db(DB_NAME);
  console.log("MongoDB connected.");
});

app.get("/status", (req, res) => {
  res.json(ledState);
});

app.post("/control-led", async (req, res) => {
  const { color, state } = req.body;
  ledState[color] = state;
  await db.collection("led_logs").insertOne({
    color, state,
    time: new Date()
  });
  res.sendStatus(200);
});

app.post("/log-ir", async (req, res) => {
  const { status } = req.body;
  await db.collection("ir_logs").insertOne({
    status,
    time: new Date()
  });
  res.sendStatus(200);
});

app.get("/logs", async (req, res) => {
  const irLogs = await db.collection("ir_logs").find().sort({ time: -1 }).limit(10).toArray();
  const ledLogs = await db.collection("led_logs").find().sort({ time: -1 }).limit(10).toArray();
  res.json({ irLogs, ledLogs });
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});