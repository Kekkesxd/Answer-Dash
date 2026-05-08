const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const leaderboardRoute = require("./routes/leaderboardRoutes");

const app = express();

app.use(cors());
app.use(express.json());

//API Routes
app.use("/api/auth", authRoutes);
app.use("/api/leaderboard", leaderboardRoute);

//Serve frontend files
app.use(express.static(path.join(__dirname,"../src")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../src/index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});