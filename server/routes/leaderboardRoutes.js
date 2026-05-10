const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  submitScore,
  leaderboard,
} = require("../controllers/leaderboardController");

router.get("/", leaderboard);
router.post("/", authMiddleware, submitScore);

module.exports = router;
