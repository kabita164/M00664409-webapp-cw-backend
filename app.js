const express = require("express");
const cors = require("cors");
const { ObjectId } = require("mongodb");
const { connectToDatabase, getDatabase } = require("./db");

let app = express();
app.use(cors());
app.use(express.json());

// Logger middleware to output all requests
function logger(req, res, next) {
  const now = new Date();
  const formattedDate = now.toLocaleString("en-GB");
  const method = req.method;
  const url = req.url;
  const status = res.statusCode;
  console.log(
    `Request log: ${formattedDate} - ${method}:${url}, status: ${status}`
  );
  next();
}
app.use(logger);

// database connection
let db;
connectToDatabase((err) => {
  if (!err) {
    const port = process.env.PORT || 3000;
    app.listen(port, function () {
      console.log("App started on port: " + port);
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
      res.status(200).json(lessons);
    })
    .catch((err) => {
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

// Add new order
app.post("/order", (req, res) => {
  const orderData = req.body;

  // Basic validation
  if (
    !orderData.name ||
    !orderData.phone ||
    !orderData.lessonIds ||
    !orderData.space
  ) {
    return res.status(400).json({ error: "Missing order data" });
  }

  db.collection("order")
    .insertOne(orderData)
    .then((result) => {
      res.status(201).json({
        message: "Order saved successfully",
        orderId: result.insertedId,
      });
    })
    .catch((err) => {
      res.status(500).json({ error: "Error saving order" });
    });
});

// Search route
app.get("/search", (req, res) => {
  const searchQuery = req.query.q;

  db.collection("lessons")
    .find({
      $or: [
        { topic: new RegExp(searchQuery, "i") },
        { location: new RegExp(searchQuery, "i") },
      ],
    })
    .toArray()
    .then((results) => {
      res.status(200).json(results);
    })
    .catch((err) => {
      res.status(500).json({ error: "An error occured during search" });
    });
});
