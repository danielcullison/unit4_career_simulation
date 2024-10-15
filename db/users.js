const client = require("./client.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT || "shhh";

const createError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const createUser = async (userName, userEmail, userPassword) => {
  try {
    const hashedPassword = await bcrypt.hash(userPassword, SALT_ROUNDS);
    const { rows } = await client.query(
      `
        INSERT INTO users (username, email, password)
        VALUES($1, $2, $3)
        RETURNING *;
      `,
      [userName, userEmail, hashedPassword]
    );
    return rows[0];
  } catch (err) {
    console.error("ERROR CREATING USER: ", err);
    throw createError("User creation failed", 500);
  }
};

const authenticate = async ({ username, password }) => {
  try {
    const { rows } = await client.query(
      `
        SELECT id, password
        FROM users
        WHERE username = $1
      `,
      [username]
    );

    if (!rows.length) {
      throw createError("not authorized", 401);
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createError("not authorized", 401);
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });
    return { token };
  } catch (err) {
    console.error("AUTHENTICATION ERROR: ", err);
    throw createError("Authentication failed", 500);
  }
};

const findUserWithToken = async (token) => {
  let id;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    id = payload.id;
  } catch (ex) {
    throw createError("not authorized", 401);
  }

  const SQL = `
    SELECT id, username
    FROM users
    WHERE id = $1
  `;
  const response = await client.query(SQL, [id]);
  if (!response.rows.length) {
    throw createError("not authorized", 401);
  }

  return response.rows[0];
};

module.exports = {
  createUser,
  authenticate,
  findUserWithToken,
};
