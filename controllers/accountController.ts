import { Router, Request, Response } from "express";
import { checkPassword, hashPassword } from "../utils/hash";
import { Server as SocketIO } from "socket.io";
import { AccountService } from "../services/accountService";

export class AccountController {
  constructor(private accountService: AccountService, private io: SocketIO) {}

  signUp = async (req: Request, res: Response): Promise<Response> => {
    const { email, username, password } = req.body;
    try {
      const userId = await this.accountService.signUp(
        email,
        username,
        password
      );
      return res.json({
        msg: "register successful",
        userId: userId,
      });
    } catch (e) {
      console.error(e);
      return res.status(400).json({ message: "Registration failed" });
    }
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { username, password } = req.body;
      const userQueryResult = await this.accountService.logIn(
        username,
        password
      );

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
  };

  logout = async (req: Request, res: Response): Promise<Response> => {
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
  };

  getUserName = async (req: Request, res: Response): Promise<Response> => {
    try {
      if (req.session.username) {
        return res.json({ data: { username: req.session.username } });
      } else {
        return res.status(400).json({ message: "You are not logged in." });
      }
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

  getUsersID = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.accountService.users();
      res.json(users);
    } catch (error) {
      console.error("An error occurred while retrieving users:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  getUserID = async (req: Request, res: Response): Promise<void> => {
    if (req.session?.userId) {
      res.json({ userId: req.session.userId, username: req.session.username });
    } else {
      res.status(401).json({ msg: "Login first" });
    }
  };

  
}
