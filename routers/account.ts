import { Router, Request, Response } from "express";
import { pgClient } from "../pgClients";
import { checkPassword, hashPassword } from "../utils/hash";

//get the existing products
export const accountRouter = Router();

accountRouter.post("/signUp", signUp);
accountRouter.post("/login", login);
accountRouter.post("/logout", logout);

accountRouter.get("/getusername", getUsername);
accountRouter.get("/users", getUsersID);
accountRouter.get("/user", getUserID);

async function signUp(req: Request, res: Response) {
  let { email, username, password } = req.body;
  let hashedPassword = await hashPassword(password);
  console.log(email, username, password, hashedPassword);
  try {
    let userQueryResult = (
      await pgClient.query(
        "SELECT username,password,id FROM users WHERE email = $1 OR username = $2",
        [email, username]
      )
    ).rows[0];
    //   email exists
    if (userQueryResult) {
      res.status(400).json({ message: "Duplicate entry." });
      return;
    }

    const insertResult = await pgClient.query(
      "INSERT INTO users (email,username,  password) VALUES ($1, $2, $3) RETURNING id",
      [email, username, hashedPassword,]
    );
    console.log(insertResult);
    const returningId = insertResult.rows[0].id;
    console.log(returningId);
    res.json({
      msg: "register successful",
      userId: returningId,
    });
  } catch (e) {
    console.log(e);
    res.status(400).json({ message: e });
  }
}

async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    // Check if the username exists in the database
    const userQueryResult = await pgClient.query(
      "SELECT username, password, id FROM users WHERE username = $1",
      [username]
    );

    if (userQueryResult.rows.length === 0) {
      console.log("Login failed: wrong username");
      return res.status(400).json({ message: "Login Failed" });
    }

    const truePassword = userQueryResult.rows[0].password;

    // Check if the provided password matches the stored password
    const isMatched = await checkPassword({
      plainPassword: password,
      hashedPassword: truePassword,
    });

    if (!isMatched) {
      console.log("Login failed: wrong password");
      return res.status(400).json({ message: "Login Failed" });
    }

    // Password matched, set the session variables
    req.session.userId = userQueryResult.rows[0].id;
    req.session.username = userQueryResult.rows[0].username;


    let result = res.json({
      message: "Login success",
      data: { username: userQueryResult.rows[0].username },
    });

    console.log(req.body.username);
    return result;
  } catch (error) {
    console.error("An error occurred during login:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function logout(req: Request, res: Response) {
  try {
    // Ensure req.sessionStore exists and has a destroy method
    if (!req.sessionStore || typeof req.sessionStore.destroy !== "function") {
      throw new Error("Session store not available");
    }

    // Clear the user session
    await new Promise<void>((resolve, reject) => {
      req.sessionStore.destroy(req.sessionID, (err: any) => {
        if (err) {
          console.error("Failed to clear user sessions", err);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // Send a success response
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    // Handle errors
    console.error("Error logging out:", error);
    return res.status(500).json({ message: "An unexpected error occurred" });
  }
}

async function getUsername(req: Request, res: Response) {
  if (req.session.username) {
    res.json({ data: { username: req.session.username } });
  } else {
    res.status(400).json({ message: "You are not logged in." });
  }
}

async function getUsersID(req: Request, res: Response) {
  try {
    const userQueryResult = await pgClient.query("SELECT * FROM users;");
    const users = userQueryResult.rows;
    res.json(users);
  } catch (error) {
    console.error("An error occurred while retrieving users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getUserID(req: Request, res: Response) {
  if (req.session.userId) {
    res.json({ userId: req.session.userId, username: req.session.username });
    return;
  } else {
    res.status(401).json({ msg: "Login first" });
  }
}

