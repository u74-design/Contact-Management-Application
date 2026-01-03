import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config(); // Load .env variables

const app = express();

// MongoDB connection
const DB_NAME = process.env.DB_NAME;
const URL = process.env.MONGO_URI;
let collection;

const client = new MongoClient(URL);

async function connectDB() {
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    collection = db.collection("UserDetails");
    console.log("MongoDB Atlas connected successfully!");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

connectDB();

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*", // allow all for now
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// --------------------- API ROUTES ---------------------

// CREATE
app.post("/userdetails", async (req, res) => {
  try {
    await collection.insertOne({ ...req.body, createdAt: new Date() });
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// READ
app.get("/getdetails", async (req, res) => {
  try {
    const data = await collection.find({}).toArray();
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE
app.delete("/deletedetail/:id", async (req, res) => {
  try {
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) return res.status(404).json({ success: false });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE
app.put("/updatedetail/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Destructure all expected fields explicitly
    const { Name, Email, Contact, Company, Address, Notes } = req.body;

    const updateData = {
      Name,
      Email,
      Contact,
      Company,
      Address,
      Notes
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }

    res.status(200).json({ success: true, message: "Contact updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});




// --------------------- START SERVER ---------------------

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
