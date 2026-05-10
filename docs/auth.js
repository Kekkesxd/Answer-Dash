const authScreen = document.getElementById("authScreen");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const showLoginButton = document.getElementById("showLoginButton");
const showRegisterButton = document.getElementById("showRegisterButton");

const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");
const loginButton = document.getElementById("loginButton");

const registerUsername = document.getElementById("registerUsername");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");
const registerButton = document.getElementById("registerButton");

const authMessage = document.getElementById("authMessage");

let loggedInUser = null;

showLoginButton.addEventListener("click", () => {
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
  authMessage.textContent = "";
});

showRegisterButton.addEventListener("click", () => {
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
  authMessage.textContent = "";
});

registerButton.addEventListener("click", async () => {
  const username = registerUsername.value.trim();
  const email = registerEmail.value.trim();
  const password = registerPassword.value;

  if (!username || !email || !password) {
    authMessage.textContent = "Please fill in all fields";
    return;
  }

  if (/\s/.test(password)) {
    authMessage.textContent = "Password cannot contain spaces.";
    return;
  }

  try {
    const result = await registerUser(username, email, password);
    console.log("Register result:", result);

    if (result.message === "User registered successfully") {
      authMessage.textContent = "Account created. You can now log in.";

      registerForm.classList.add("hidden");
      loginForm.classList.remove("hidden");

      loginUsername.value = username;
      loginPassword.value = "";
    } else {
      authMessage.textContent = result.message || "Register Failed";
    }
  } catch (error) {
    console.error("Register error", error);
    authMessage.textContent = "Could not connect to the server";
  }
});

loginButton.addEventListener("click", async () => {
  const username = loginUsername.value.trim();
  const password = loginPassword.value;

  if (!username || !password) {
    authMessage.textContent = "Please enter username and password.";
    return;
  }

  try {
    const result = await loginUser(username, password);

    if (result.message === "Login successful") {
      loggedInUser = result.user;

      localStorage.setItem("username", result.user.username);

      window.location.href = "index.html";
    } else {
      authMessage.textContent = result.message || "Login failed.";
    }
  } catch (error) {
    console.error("Login error:", error);
    authMessage.textContent = "Could not connect to the server";
  }
});

async function redirectLoggedinUser() {
  try {
    const result = await getCurrUser();

    if (result.loggedIn) {
      localStorage.setItem("username", result.user.username);
      window.location.href = "index.html";
    }
  } catch (error) {
    console.log("No Active login.");
  }
}

redirectLoggedinUser();
