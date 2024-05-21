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

  login = async (req:Request,res:Response): Promise<Response> => {
    try {
        const { username, password } = req.body;
        const userQueryResult = await this.accountService.logIn(username,password);
        
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
}
