const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getMyQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/questionController");

router.get("/my", authMiddleware, getMyQuestions);
router.post("/", authMiddleware, createQuestion);
router.put("/:id", authMiddleware, updateQuestion);
router.delete("/:id", authMiddleware, deleteQuestion);

module.exports = router;