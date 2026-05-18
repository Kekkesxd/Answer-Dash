const pool = require("../config/db");

async function findQuestionsByUser(userId) {
  try {
    const result = await pool.query(
      `SELECT id, user_id, theme, question, answers, correct, created_at, updated_at
       FROM custom_questions
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return result.rows;
  } catch (err) {
    console.error("Find questions error:", err);
    throw new Error("Find_Questions_Failed");
  }
}

async function addQuestions(userId, theme, questionText, answers, correct) {
  try {
    const result = await pool.query(
      `INSERT INTO custom_questions(user_id, theme, question, answers, correct)
       VALUES($1, $2, $3, $4, $5)
       RETURNING id, user_id, theme, question, answers, correct, created_at, updated_at`,
      [userId, theme, questionText.trim(), JSON.stringify(answers), correct]
    );

    return result.rows[0];
  } catch (err) {
    console.error("Add question error:", err);
    throw new Error("Add_Questions_Failed");
  }
}

async function editQuestions(
  questionId,
  userId,
  theme,
  questionText,
  answers,
  correct
) {
  try {
    const result = await pool.query(
      `UPDATE custom_questions
       SET theme = $1,
           question = $2,
           answers = $3,
           correct = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND user_id = $6
       RETURNING id, user_id, theme, question, answers, correct, created_at, updated_at`,
      [
        theme,
        questionText.trim(),
        JSON.stringify(answers),
        correct,
        questionId,
        userId,
      ]
    );

    return result.rows[0];
  } catch (err) {
    console.error("EDIT QUESTION ERROR:", err);
    throw new Error("EDIT_QUESTION_FAILED");
  }
}

async function removeQuestion(questionId, userId) {
  try {
    const result = await pool.query(
      `DELETE FROM custom_questions
       WHERE id = $1 AND user_id = $2
       RETURNING id, user_id, theme, question, answers, correct`,
      [questionId, userId]
    );

    return result.rows[0];
  } catch (err) {
    console.error("DELETE QUESTION ERROR:", err);
    throw new Error("DELETE_QUESTION_FAILED");
  }
}

module.exports = {
  findQuestionsByUser,
  addQuestions,
  editQuestions,
  removeQuestion,
};
