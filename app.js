// Set up server
import express from "express";
import connectDB from "./dbConnection.js";
import Questions from "./routes/questions.js";
import Settings from "./routes/settings.js";
import Contestants from "./routes/contestants.js";
import Categories from "./routes/categories.js";

const args = process.argv;
let envMode = "";

if (!process.env.NODE_ENV) {
  if (args[args.length - 1] === "production") {
    envMode = "production";
  } else {
    envMode = "development";
  }
}

const PORT = process.env.PORT || 8000;
const app = express();

// Connect to DB
connectDB(process.env.MONGODB_URL || "mongodb://localhost:27017/kviz_baza");

// Set static directory
if (process.env.NODE_ENV === "production" || envMode === "production") {
  app.use(express.static("dist"));
} else {
  app.use(express.static("public"));
}

// Config ejs
app.set("view engine", "ejs");
app.set("views", "views");

// Middleware
app.use(express.json()); // Parse JSON bodies

// Routes
app.use("/api/categories", Categories);
app.use("/api/contestants", Contestants);
app.use("/api/questions", Questions);
app.use("/api/settings", Settings);

app.get("/start", (req, res) => {
  res.render("questions");
});

app.get("/leaderboard", (req, res) => {
  res.render("leaderboard");
});

app.get("/settings", (req, res) => {
  res.render("settings");
});

app.listen(PORT, () => console.log(`SERVER RUNNING: http://127.0.0.1:${PORT}`));
