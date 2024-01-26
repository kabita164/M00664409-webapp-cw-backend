const express = require("express");
const cors = require("cors");
const { connectToDatabase, getDatabase } = require("./db");

let app = express();
app.use(cors());
app.use(express.json());

// database connection
let db;
connectToDatabase((err) => {
  if (!err) {
    app.listen(3000, function () {
      console.log("Listening on port 3000");
    });
    db = getDatabase();
  }
});

// Routes
app.get("/lessons", (req, res) => {
  db.collection("lessons")
    .find()
    .toArray()
    .then((lessons) => {
      console.log("Fetched lessons:", lessons);
    })
    .catch((err) => {
      console.error("Error fetching lessons:", err);
      res.status(500).json({ error: "Could not fetch the documents" });
    });
});

app.param("collectionName", function (req, res, next, collectionName) {
  req.collection = db.collection(collectionName);
  next();
});

app.get("/collections/:collectionName", (req, res) => {
  req.collection
    .find()
    .toArray()
    .then((results) => {
      console.log("Query successful, results:", results);
      res.status(200).json(results);
    })
    .catch((err) => {
      console.error("Error during MongoDB query:", err);
      res.status(500).json({ error: "Error during MongoDB query" });
    });
});
