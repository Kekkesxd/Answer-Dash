const pool =require("../config/db");

async function saveScore(userId, playerName, theme, difficulty, score) {
    
    try{
        const result = await pool.query(
             `INSERT INTO scores(user_id, player_name, theme, difficulty, score)
             VALUES($1, $2, $3, $4, $5)
             RETURNING id, user_id, player_name, theme, difficulty, score, created_at`,
            [userId, playerName, theme, difficulty, score]
        );
        
        return result.rows[0];
    }catch(err){
        console.error("SAVE SCORE ERROR:", err);
        throw new Error("SAVE_SCORE_FAILED");
    }
}

async function getLeaderboard(theme) {
    try{
        const result = await pool.query(
            `SELECT 
                scores.id,
                scores.player_name,
                scores.theme,
                scores.difficulty,
                scores.score,
                scores.created_at,
                users.username
             FROM scores
             JOIN users ON scores.user_id = users.id
             WHERE scores.theme = $1 AND scores.difficulty = 'endless'
             ORDER BY scores.score DESC, scores.created_at ASC
             LIMIT 10`,
             [theme]
        );
        return result.rows;
    }catch(err){
        throw new Error("GET_LEADERBOARD_FAILED");
    }
}

module.exports = {
    saveScore,
    getLeaderboard
};