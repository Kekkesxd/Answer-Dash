const API_URL ="http://localhost:3000";

async function registerUser(username, email, password) {
    const respone = await fetch (`${API_URL}/api/auth/register`,{
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            username,
            email,
            password
        })
    });

    return respone.json();
}

async function loginUser(username, password) {
    const respone = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            username,
            password
        })
    });
    return respone.json();
}

async function logoutUser() {
     const respone = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include"
    });
    return respone.json();
}

async function sumbitLBScore(score) {
     const respone = await fetch(`${API_URL}/api/leaderboard`, {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            score
        })
    });
    return respone.json();
}

async function getLeaderboard() {
     const respone = await fetch(`${API_URL}/api/leaderboard`, {
        method: "GET",
        credentials: "include"
    });

    return respone.json();
}
