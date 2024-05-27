import { Router, Request, Response } from "express";
import { pgClient } from "../pgClients";
import { checkPassword, hashPassword } from "../utils/hash";
import { AccountController } from "../controllers/accountController";
import { Server as SocketIO } from "socket.io";
import formidable from "formidable";

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

accountRouter.get("/getProfilePic/:username",getProfilePic);
accountRouter.put("/editProfilePic/:username", editProfilePic)

async function getProfilePic(req:Request,res:Response) {
  try{
    if (req.session.id) {
      const username = req.session.username;
      const picResult = (await pgClient.query("SELECT p1,p2,p3,p4,p5,p6 FROM users WHERE username = $1",[username])).rows[0];
      return res.json (picResult);
    } else {
      return res.status(400).json({ message: "You are not logged in." });
    }

  }catch(e){
    console.error("error");
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function editProfilePic(req: Request, res: Response) {
  const form = formidable({
    uploadDir: __dirname + "/../uploads",
    keepExtensions: true,
    minFileSize: 0,
    allowEmptyFiles: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Internal server error!" });
    }

    let p1 = files.p1 ? files.p1[0] : null;
    let p2 = files.p2 ? files.p2[0] : null;
    let p3 = files.p3 ? files.p3[0] : null;
    let p4 = files.p4 ? files.p4[0] : null;
    let p5 = files.p5 ? files.p5[0] : null;
    let p6 = files.p6 ? files.p6[0] : null;

    try {
      let editProfileResult = await pgClient.query(
        "UPDATE USERS SET p1 = $1, p2 = $2, p3 = $3, p4 = $4, p5 = $5, p6 = $6 RETURNING id",
        [p1, p2, p3, p4, p5, p6]
      );
      return res.status(200).json({ message: "Profile pictures updated successfully" });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
}


