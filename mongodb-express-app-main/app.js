
import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000;

const mongoUrl = process.env.MONGO_URI;
const databaseName = process.env.DB_NAME || "library_db";

let db;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Homepage
app.get("/", (req, res) => {
  res.send("Library Management API is running!");
});

// Create a new book
app.post("/api/v1/books", async (req, res, next) => {
  try {
    const { title, author, category, price } = req.body;

    if (!title || !author || !category || price == null) {
      return res.status(400).json({
        message: "All book fields are required"
      });
    }

    const result = await db.collection("books").insertOne({
      title,
      author,
      category,
      price
    });

    res.status(201).json({
      message: "Book created successfully",
      data: {
        _id: result.insertedId,
        title,
        author,
        category,
        price
      }
    });
  } catch (err) {
    next(err);
  }
});

// Get all books or filter by category
app.get("/api/v1/books", async (req, res, next) => {
  try {
    const category = req.query.category;
    const query = category ? { category } : {};

    const books = await db.collection("books").find(query).toArray();

    res.status(200).json({
      message: "Books fetched successfully",
      data: books
    });
  } catch (err) {
    next(err);
  }
});

// Get a single book
app.get("/api/v1/books/:id", async (req, res, next) => {
  try {
    const bookId = req.params.id;

    if (!ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const book = await db.collection("books").findOne({
      _id: new ObjectId(bookId)
    });

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({
      message: "Book fetched successfully",
      data: book
    });
  } catch (err) {
    next(err);
  }
});

// Update a book
app.put("/api/v1/books/:id", async (req, res, next) => {
  try {
    const bookId = req.params.id;
    const { title, author, category, price } = req.body;

    if (!ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    if (!title || !author || !category || price == null) {
      return res.status(400).json({
        message: "All book fields are required"
      });
    }

    const book = { title, author, category, price };

    const result = await db.collection("books").updateOne(
      { _id: new ObjectId(bookId) },
      { $set: book }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({
      message: "Book updated successfully",
      data: { _id: new ObjectId(bookId), ...book }
    });
  } catch (err) {
    next(err);
  }
});

// Delete a book
app.delete("/api/v1/books/:id", async (req, res, next) => {
  try {
    const bookId = req.params.id;

    if (!ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const result = await db.collection("books").deleteOne({
      _id: new ObjectId(bookId)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({
      message: "Book deleted successfully"
    });
  } catch (err) {
    next(err);
  }
});

// 404 middleware
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error"
  });
});

// Connect MongoDB and start server
const startServer = async () => {
  try {
    if (!mongoUrl) {
      throw new Error("MONGO_URI environment variable is missing");
    }

    if (!mongoUrl.startsWith("mongodb://") &&
        !mongoUrl.startsWith("mongodb+srv://")) {
      throw new Error("Invalid MongoDB connection string");
    }

    const client = new MongoClient(mongoUrl);

    await client.connect();

    db = client.db(databaseName);

    console.log("Connected to MongoDB successfully!");
    console.log(`Database: ${databaseName}`);

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

startServer();
