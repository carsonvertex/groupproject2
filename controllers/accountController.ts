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
}
