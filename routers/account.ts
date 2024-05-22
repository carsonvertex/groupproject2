import { Router, Request, Response } from "express";
import { pgClient } from "../pgClients";
import { checkPassword, hashPassword } from "../utils/hash";
import { AccountController } from "../controllers/accountController";
import { Server as SocketIO } from "socket.io";

import { AccountService } from "../services/accountService";
//get the existing products
// Instantiate the dependencies
const accountService = new AccountService(pgClient); // Make sure pgClient is passed correctly
const io = new SocketIO(); // Adjust this according to your actual Socket.IO setup
const accountController = new AccountController(accountService, io);
export const accountRouter = Router();

accountRouter.post("/signUp", accountController.signUp);
accountRouter.post("/logIn", accountController.login);
accountRouter.post("/logOut", accountController.logout);

// accountRouter.get("/getusername", getUsername);
// accountRouter.get("/users", getUsersID);
// accountRouter.get("/user", getUserID);


async function getUsername(req: Request, res: Response) {
  if (req.session.username) {
    res.json({ data: { username: req.session.username } });
  } else {
    res.status(400).json({ message: "You are not logged in." });
  }
}

// async function getUsersID(req: Request, res: Response) {
//   try {
//     const userQueryResult = await pgClient.query("SELECT * FROM users;");
//     const users = userQueryResult.rows;
//     res.json(users);
//   } catch (error) {
//     console.error("An error occurred while retrieving users:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// }

// async function getUserID(req: Request, res: Response) {
//   if (req.session.userId) {
//     res.json({ userId: req.session.userId, username: req.session.username });
//     return;
//   } else {
//     res.status(401).json({ msg: "Login first" });
//   }
// }
