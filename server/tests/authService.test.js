const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { registerUser, loginUser } = require("../services/authService");

jest.mock("../config/db");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_SECRET = "test_secret";
});

//
// REGISTER USER
//
test("registerUser hashes password and inserts user", async () => {
  bcrypt.hash.mockResolvedValue("hashedPassword");

  pool.query.mockResolvedValue({
    rows: [
      {
        id: 1,
        username: "lama",
        email: "lama@mail.com",
      },
    ],
  });

  const user = await registerUser("lama", "lama@mail.com", "123456");

  expect(bcrypt.hash).toHaveBeenCalledWith("123456", 10);
  expect(pool.query).toHaveBeenCalled();

  expect(user.id).toBe(1);
  expect(user.username).toBe("lama");
  expect(user.email).toBe("lama@mail.com");
});

test("registerUser trims username and lowercases email", async () => {
  bcrypt.hash.mockResolvedValue("hashedPassword");

  pool.query.mockResolvedValue({
    rows: [
      {
        id: 1,
        username: "lama",
        email: "lama@mail.com",
      },
    ],
  });

  await registerUser("  lama  ", "LAMA@MAIL.COM", "123456");

  expect(pool.query).toHaveBeenCalledWith(expect.any(String), [
    "lama",
    "lama@mail.com",
    "hashedPassword",
  ]);
});

test("registerUser throws USER_ALREADY_EXISTS on duplicate username or email", async () => {
  bcrypt.hash.mockResolvedValue("hashedPassword");

  pool.query.mockRejectedValue({
    code: "23505",
  });

  await expect(registerUser("lama", "lama@mail.com", "123456")).rejects.toThrow(
    "USER_ALREADY_EXISTS"
  );
});

test("registerUser throws original error for non-duplicate database error", async () => {
  bcrypt.hash.mockResolvedValue("hashedPassword");

  pool.query.mockRejectedValue(new Error("DATABASE_ERROR"));

  await expect(registerUser("lama", "lama@mail.com", "123456")).rejects.toThrow(
    "DATABASE_ERROR"
  );
});

//
// LOGIN USER
//
test("loginUser returns token and user on success", async () => {
  pool.query.mockResolvedValue({
    rows: [
      {
        id: 1,
        username: "lama",
        email: "lama@mail.com",
        password_hash: "hashedPassword",
      },
    ],
  });

  bcrypt.compare.mockResolvedValue(true);
  jwt.sign.mockReturnValue("token123");

  const result = await loginUser("lama", "123456");

  expect(pool.query).toHaveBeenCalledWith(expect.any(String), ["lama"]);

  expect(bcrypt.compare).toHaveBeenCalledWith("123456", "hashedPassword");

  expect(jwt.sign).toHaveBeenCalled();

  expect(result.token).toBe("token123");
  expect(result.user.id).toBe(1);
  expect(result.user.username).toBe("lama");
  expect(result.user.email).toBe("lama@mail.com");
});

test("loginUser throws INVALID_LOGIN if username is not found", async () => {
  pool.query.mockResolvedValue({
    rows: [],
  });

  await expect(loginUser("wronguser", "123456")).rejects.toThrow(
    "INVALID_CREDENTIALS"
  );
});

test("loginUser throws INVALID_LOGIN if password is incorrect", async () => {
  pool.query.mockResolvedValue({
    rows: [
      {
        id: 1,
        username: "lama",
        email: "lama@mail.com",
        password_hash: "hashedPassword",
      },
    ],
  });

  bcrypt.compare.mockResolvedValue(false);

  await expect(loginUser("lama", "wrongpassword")).rejects.toThrow(
    "INVALID_CREDENTIALS"
  );
});
