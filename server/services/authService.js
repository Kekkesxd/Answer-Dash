const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function registerUser(username ,email, password) {
    const user = username.trim();
    const cEmail = email.trim().toLowerCase();

    const passwordHash = await bcrypt.hash(password, 10);

    try{
    const result = await pool.query(
        `INSERT INTO users(username, email, password_hash)
        VALUES($1, $2, $3)
        RETURNING id`,
         [user, cEmail, passwordHash]
        );
        return result.rows[0];
    }catch(err){
        if(err.code === "23505"){
            throw new Error("USER_ALREADY_EXISTS");
        }
        throw err;
    }
}

async function loginUser(username, password) {
    const cUser = username.trim();

    try{ const result = await pool.query(
            `SELECT id, username, email, password_hash
            FROM users
            WHERE username = $1`,
            [cUser]
        );

        if(result.rows.length === 0){
            throw new Error("INVALID_CREDENTIALS");
        }
        
        const user = result.rows[0];

        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if(!passwordMatch){
            throw new Error("INVALID_CREDENTIALS");
        }

        const token = jwt.sign({
            id: user.id,
            username: user.username,
            email: user.email
        },
        process.env.JWT_SECRET,
        {expiresIn: "1h"}
    );
    
    return{
        token,
        user:{
            id: user.id,
            username: user.username,
            email: user.email
        }
    };
}catch(err){
    if(err.message === "INVALID_CREDENTIALS"){
        throw err;
    }
    throw err
}
}
module.exports = {
    registerUser,
    loginUser
};