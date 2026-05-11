const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  submitScore,
  leaderboard,
} = require("../controllers/leaderboardController");

/**
 * @swagger
 * tags:
 *   name: Leaderboard
 *   description: Leaderboard score routes
 */

/**
 * @swagger
 * /api/leaderboard:
 *   get:
 *     summary: Get leaderboard scores
 *     tags: [Leaderboard]
 *     description: Returns the top leaderboard scores.
 *     responses:
 *       200:
 *         description: Leaderboard loaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   user_id:
 *                     type: integer
 *                     example: 12
 *                   player_name:
 *                     type: string
 *                     example: Kekkersxd
 *                   username:
 *                     type: string
 *                     example: Kekkersxd
 *                   score:
 *                     type: integer
 *                     example: 10
 *                   created_at:
 *                     type: string
 *                     example: 2026-05-11T12:30:00.000Z
 *       500:
 *         description: Could not load leaderboard
 */

/**
 * @swagger
 * /api/leaderboard:
 *   post:
 *     summary: Submit a leaderboard score
 *     tags: [Leaderboard]
 *     description: Saves or updates the logged-in user's highest score. Requires the user to be logged in.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - score
 *             properties:
 *               score:
 *                 type: number
 *                 example: 10
 *     responses:
 *       201:
 *         description: Score saved successfully
 *       400:
 *         description: Score is missing or invalid
 *       401:
 *         description: User is not logged in
 *       500:
 *         description: Could not save score
 */

router.get("/", leaderboard);
router.post("/", authMiddleware, submitScore);

module.exports = router;
