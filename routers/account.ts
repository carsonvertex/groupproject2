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
// accountRouter.post("/logOut", logout);

// accountRouter.get("/getusername", getUsername);
// accountRouter.get("/users", getUsersID);
// accountRouter.get("/user", getUserID);



// async function logout(req: Request, res: Response) {
//   try {
//     // Ensure req.sessionStore exists and has a destroy method
//     if (!req.sessionStore || typeof req.sessionStore.destroy !== "function") {
//       throw new Error("Session store not available");
//     }

//     // Clear the user session
//     await new Promise<void>((resolve, reject) => {
//       req.sessionStore.destroy(req.sessionID, (err: any) => {
//         if (err) {
//           console.error("Failed to clear user sessions", err);
//           reject(err);
//         } else {
//           resolve();
//         }
//       });
//     });

//     // Send a success response
//     return res.status(200).json({ message: "Logout successful" });
//   } catch (error) {
//     // Handle errors
//     console.error("Error logging out:", error);
//     return res.status(500).json({ message: "An unexpected error occurred" });
//   }
// }

// async function getUsername(req: Request, res: Response) {
//   if (req.session.username) {
//     res.json({ data: { username: req.session.username } });
//   } else {
//     res.status(400).json({ message: "You are not logged in." });
//   }
// }

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
