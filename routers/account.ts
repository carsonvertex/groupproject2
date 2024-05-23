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

accountRouter.get("/getusername", accountController.getUserName);
accountRouter.get("/users", accountController.getUsersID);
accountRouter.get("/user", accountController.getUserID);

accountRouter.get("/getProfilePic",getProfilePic);

async function getProfilePic(req:Request,res:Response) {
  try{
    if (req.session.id) {
      const id = req.session.id;
      const picResult = await pgClient.query("SELECT p1,p2,p3,p4,p5,p6 FROM users WHERE id = $1",[id]);
      console.log(picResult)
      return res.json({ data: { username: req.session.username } });
    } else {
      return res.status(400).json({ message: "You are not logged in." });
    }

  }catch(e){
    console.error("error");
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

