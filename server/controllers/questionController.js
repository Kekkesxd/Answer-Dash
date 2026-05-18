const {
  findQuestionsByUser,
  addQuestions,
  editQuestions,
  removeQuestion,
} = require("../services/questionService");

function validateQuestionInput(question, answers, correct) {
  if (!question || !answers || correct === undefined) {
    return "Question, answers, and correct index are required";
  }

  if (typeof question !== "string" || question.trim() === "") {
    return "Question must be a non-empty string";
  }

  if (!Array.isArray(answers) || answers.length !== 4) {
    return "Answers must be an array with exactly 4 items";
  }

  if (
    answers.some(
      (answer) => typeof answer !== "string" || answer.trim() === ""
    )
  ) {
    return "All answers must be non-empty strings";
  }

  if (!Number.isInteger(correct) || correct < 0 || correct > 3) {
    return "Correct must be a number between 0 and 3";
  }

  return null;
}

async function getMyQuestions(req, res) {
  try {
    const questions = await findQuestionsByUser(req.user.id);

    return res.status(200).json(questions);
  } catch (err) {
    if (err.message === "FIND_QUESTIONS_FAILED") {
      return res.status(500).json({
        message: "Could not load questions",
      });
    }

    return res.status(500).json({
      message: "Server error",
    });
  }
}

async function createQuestion(req, res) {
  try {
    const { theme = "custom", question, answers, correct } = req.body || {};

    const error = validateQuestionInput(question, answers, correct);

    if (error) {
      return res.status(400).json({
        message: error,
      });
    }

    const newQuestion = await addQuestions(
      req.user.id,
      theme,
      question,
      answers,
      correct
    );

    return res.status(201).json({
      message: "Question created successfully",
      question: newQuestion,
    });
  } catch (err) {
    console.error("Create question controller Error:", err);
    
    if (err.message === "ADD_QUESTION_FAILED") {
      return res.status(500).json({
        message: "Could not create question",
      });
    }

    return res.status(500).json({
      message: "Server error",
    });
  }
}

async function updateQuestion(req, res) {
  try {
    const questionId = Number(req.params.id);
    const { theme = "custom", question, answers, correct } = req.body || {};

    if (!Number.isInteger(questionId)) {
      return res.status(400).json({
        message: "Invalid question id",
      });
    }

    const error = validateQuestionInput(question, answers, correct);

    if (error) {
      return res.status(400).json({
        message: error,
      });
    }

    const updatedQuestion = await editQuestions(
      questionId,
      req.user.id,
      theme,
      question,
      answers,
      correct
    );

    if (!updatedQuestion) {
      return res.status(404).json({
        message: "Question not found or you do not own this question",
      });
    }

    return res.status(200).json({
      message: "Question updated successfully",
      question: updatedQuestion,
    });
  } catch (err) {
    if (err.message === "EDIT_QUESTION_FAILED") {
      return res.status(500).json({
        message: "Could not update question",
      });
    }

    return res.status(500).json({
      message: "Server error",
    });
  }
}

async function deleteQuestion(req, res) {
  try {
    const questionId = Number(req.params.id);

    if (!Number.isInteger(questionId)) {
      return res.status(400).json({
        message: "Invalid question id",
      });
    }

    const deletedQuestion = await removeQuestion(questionId, req.user.id);

    if (!deletedQuestion) {
      return res.status(404).json({
        message: "Question not found or you do not own this question",
      });
    }

    return res.status(200).json({
      message: "Question deleted successfully",
      question: deletedQuestion,
    });
  } catch (err) {
    if (err.message === "DELETE_QUESTION_FAILED") {
      return res.status(500).json({
        message: "Could not delete question",
      });
    }

    return res.status(500).json({
      message: "Server error",
    });
  }
}

module.exports = {
  getMyQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};