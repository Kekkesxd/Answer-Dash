const pool = require("../config/db");

async function saveScore(userId, playerName, score) {
  try {
    const result = await pool.query(
      `INSERT INTO scores(user_id, player_name, score)
            VALUES($1, $2, $3)
            ON CONFLICT (user_id)
            DO UPDATE SET
                player_name = EXCLUDED.player_name,
                score = GREATEST(scores.score, EXCLUDED.score),
                updated_at = CASE
                    WHEN EXCLUDED.score > scores.score THEN CURRENT_TIMESTAMP
                    ELSE scores.updated_at
                END
            RETURNING id, user_id, player_name, score, created_at, updated_at`,
      [userId, playerName, score]
    );

    return result.rows[0];
  } catch (err) {
    console.error("SAVE SCORE ERROR:", err);
    throw new Error("SAVE_SCORE_FAILED");
  }
}

async function getLeaderboard() {
  try {
    const result = await pool.query(
      `SELECT 
                scores.id,
                scores.user_id,
                scores.player_name,
                scores.score,
                scores.created_at,
                users.username
             FROM scores
             JOIN users ON scores.user_id = users.id
             ORDER BY scores.score DESC, scores.created_at ASC
             LIMIT 10`
    );
    return result.rows;
  } catch (err) {
    throw new Error("GET_LEADERBOARD_FAILED");
  }
}

module.exports = {
  saveScore,
  getLeaderboard,
};
