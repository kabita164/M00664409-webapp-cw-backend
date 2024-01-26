const express = require("express");
const cors = require("cors");
const { ObjectId } = require("mongodb");
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
// Get all lessons
app.get("/lessons", (req, res) => {
  db.collection("lessons")
    .find()
    .toArray()
    .then((lessons) => {
      console.log("Fetched lessons:", lessons);
      res.status(200).json(lessons);
    })
    .catch((err) => {
      console.error("Error fetching lessons:", err);
      res.status(500).json({ error: "Could not fetch the documents" });
    });
});

// Update lesson data
app.put("/lessons/:id", (req, res) => {
  const updateData = req.body;

  db.collection("lessons")
    .updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData },
      { safe: true },
      { multi: false }
    )
    .then((result) => {
      res.status(200).json({ message: "Lesson updated successfully" });
    })
    .catch((err) => {
      res.status(500).json({ error: "Error updating lesson" });
    });
});
