import jwt from "jsonwebtoken";
import { config } from "../config/app.config.js";
import { connection } from "../database/db.js";

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "username/password is required" });
    }

    let [isUserExist] = await connection.query(
      `SELECT * FROM user WHERE (email = ${username} OR phone_number = ${username}) AND BINARY  password = '${password}'`
    );

    isUserExist = isUserExist[0];

    if (isUserExist) {
      if (isUserExist.is_locked) {
        return res.status(403).json({ message: "Account locked" });
      }
      // resetting login attempt on successful login
      isUserExist.login_attempt && (await trackFailedAttempts(username, 0));

      const token = jwt.sign({ username }, config.SECRET_KEY, {
        expiresIn: config.TOKEN_EXPIRE,
      });
      await saveOrRemoveToken(username, token, "auth_token");

      res.json({ token });
    } else {
      // Track failed attempts
      await trackFailedAttempts(username, 1);
      await saveOrRemoveToken(username, "", "auth_token");

      await lockOrUnlockUser(username);
      res.status(401).json({ message: "Invalid username or password" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

const trackFailedAttempts = async (username, login_attempt) => {
  // Logic to increment failed attempts in DB
  await connection.query(
    ` UPDATE user
      SET login_attempt = ${
        login_attempt ? "login_attempt + 1" : login_attempt
      } 
      WHERE (email = '${username}' OR phone_number = ${username})`
  );
};

const saveOrRemoveToken = async (username, token, tokenType) => {
  await connection.query(
    ` UPDATE user
      SET ${tokenType} = "${token}"
      WHERE (email = '${username}' OR phone_number = ${username})`
  );
};
const lockOrUnlockUser = async (username) => {
  // lock user account
  await connection.query(
    ` UPDATE user
      SET is_locked = CASE 
        WHEN login_attempt > ${config.LOGIN_ATTEMPT} THEN 1 
        ELSE 0 
      END
      WHERE (email = '${username}' OR phone_number = ${username})`
  );
};

const findUserByUsername = async (username) => {
  const [isUserExist] = await connection.query(
    `SELECT * FROM user WHERE (email = ${username} OR phone_number = ${username})`
  );
  return isUserExist[0];
};

export const generateLink = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username)
      return res.status(400).json({ message: "Username is required" });
    const isUserExist = await findUserByUsername(username);

    if (!isUserExist) {
      return res.status(404).json({ message: "User not found" });
    }
    const oneTimeToken = jwt.sign({ username }, config.SECRET_KEY, {
      expiresIn: config.MAGIC_LINK_EXPIRE,
    });
    const oneTimeLink = `http://localhost:${config.PORT}/api/v1/loginbylink/${oneTimeToken}`;

    // Save the token in DB as one-time-use only
    await saveOrRemoveToken(username, oneTimeToken, "magic_token");
    res.json({ oneTimeLink });
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const magicTokenVerify = (req, res) => {
  const { token } = req.params;

  jwt.verify(token, config.SECRET_KEY, async (err, user) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    const isUserExist = await findUserByUsername(user.username);
    if (isUserExist.magic_token === token) {
      // Generate a valid token for further use
      const authToken = jwt.sign(
        { username: user.username },
        config.SECRET_KEY,
        {
          expiresIn: config.TOKEN_EXPIRE,
        }
      );
      await saveOrRemoveToken(user.username, authToken, "magic_token");
      await saveOrRemoveToken(user.username, "", "magic_token"); // Mark one-time token as used
      res.json({ token: authToken });
    } else {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  });
};

export const time = (req, res) => {
  const token = req.headers.authorization.split(" ")[1]; // Bearer <token>

  jwt.verify(token, config.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    res.json({ currentTime: new Date().toISOString() });
  });
};

export const kickout = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    await Promise.allSettled([
      saveOrRemoveToken(username, "", "auth_token"),
      saveOrRemoveToken(username, "", "magic_token"),
    ]);
    res.json({ message: `User ${username} has been kicked out.` });
  } catch (error) {
    res.status(500).json({ error });
  }
};
