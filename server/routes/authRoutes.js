const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  currUser,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication routes
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: Kekkersxd
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Missing or invalid input
 *       409:
 *         description: Username or email already exists
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     description: Logs in a user and stores the JWT token in an httpOnly cookie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: Kekkersxd
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Missing username or password
 *       401:
 *         description: Invalid username or password
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/auth/currUser:
 *   get:
 *     summary: Get current logged-in user
 *     tags: [Auth]
 *     description: Checks the JWT cookie and returns the currently logged-in user.
 *     responses:
 *       200:
 *         description: Current user returned successfully
 *       401:
 *         description: No token, invalid token, or expired token
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     description: Clears the JWT token cookie.
 *     responses:
 *       200:
 *         description: Logged out successfully
 */

router.post("/register", register);
router.post("/login", login);
router.get("/currUser", authMiddleware, currUser);
router.post("/logout", logout);

module.exports = router;
