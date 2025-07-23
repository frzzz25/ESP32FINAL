const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");

const app = express();
const port = 10000;

app.use(cors());
app.use(bodyParser.json());

const uri = "mongodb://frzzz25:00000000@cluster0-shard-00-00.wku9p4h.mongodb.net:27017,cluster0-shard-00-01.wku9p4h.mongodb.net:27017,cluster0-shard-00-02.wku9p4h.mongodb.net:27017/?ssl=true&replicaSet=atlas-4um5lg-shard-0&authSource=admin&retryWrites=true&w=majority";

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("esp32_logs");
    const collection = db.collection("activities");

    app.post("/log", async (req, res) => {
      const log = req.body;
      log.timestamp = new Date();
      await collection.insertOne(log);
      res.status(200).send("Log saved");
    });

    app.get("/logs", async (req, res) => {
      const logs = await collection.find({}).sort({ timestamp: -1 }).limit(50).toArray();
      res.json(logs);
    });

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error("Server error:", err);
  }
}

run();
