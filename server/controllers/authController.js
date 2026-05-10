const { registerUser, loginUser } = require("../services/authService");

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (username.trim().length < 3) {
      return res.status(400).json({
        message: "Username must be atleast 3 characters",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Please Enter a Valid email",
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password has to be atleast 8 character",
      });
    }
    if (/\s/.test(password)) {
      return res.status(400).json({
        message: "Password cannot contain spaces",
      });
    }

    const user = await registerUser(username, email, password);

    return res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (err) {
    if (err.message === "USER_ALREADY_EXISTS") {
      return res.status(409).json({
        message: "Username or email already exists",
      });
    }
    console.error(err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "All Fields must be filled",
      });
    }

    const result = await loginUser(username, password);

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: true,
      sameSite:"none",
      maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      user: result.user,
    });
  } catch (err) {
    if (err.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({
        message: "invalid username or password",
      });
    }
    console.error(err);

    return res.status(500).json({
      message: "Server Error",
    });
  }
}

function currUser(req, res) {
  return res.status(200).json({
    loggedIn: true,
    user: req.user,
  });
}

async function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return res.status(200).json({
    message: "Logged Out Successfully",
  });
}

module.exports = {
  register,
  login,
  currUser,
  logout,
};
