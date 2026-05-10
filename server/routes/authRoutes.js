const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  currUser,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/currUser", authMiddleware, currUser);
router.post("/logout", logout);

module.exports = router;
