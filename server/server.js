const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const leaderboardRoute = require("./routes/leaderboardRoutes");

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "https://kekkesxd.github.io",
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("Request origin:", origin);

      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Not Allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

//API Routes
app.use("/api/auth", authRoutes);
app.use("/api/leaderboard", leaderboardRoute);

//Serve frontend files
app.use(express.static(path.join(__dirname, "../docs")));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
