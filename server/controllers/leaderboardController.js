const {saveScore, getLeaderboard} =require("../services/leaderboardService");

async function submitScore(req,res) {
    try{
      
        const { score} =req.body;
        const playerName = req.user.username;

        if( score === undefined){
            return res.status(400).json({
                message: "Score is required"
            });
        }
        
        if(typeof score !== "number"){
            return res.status(400).json({
                message: "Score must be a number"
            });
        }
        
        const savedScore = await saveScore(
            req.user.id,
            playerName,
            score
        );

        return res.status(201).json({
            message: "Score saved",
            score: savedScore
        });

    } catch (err) {
        if (err.message === "SAVE_SCORE_FAILED") {
            return res.status(500).json({
                message: "Could not save score"
            });
        }

        return res.status(500).json({
            message: "Server error"
        });
    }
}

async function leaderboard(req, res) {
    try {
        const scores = await getLeaderboard();

        return res.status(200).json(scores);

    } catch (err) {
        if (err.message === "GET_LEADERBOARD_FAILED") {
            return res.status(500).json({
                message: "Could not load leaderboard"
            });
        }

        return res.status(500).json({
            message: "Server error"
        });
    }
}

module.exports = {
    submitScore,
    leaderboard
};