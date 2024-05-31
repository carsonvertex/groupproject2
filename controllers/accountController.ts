import { Router, Request, Response } from "express";
import { Server as SocketIO } from "socket.io";
import { AccountService } from "../services/accountService";
import formidable from "formidable";

export class AccountController {
  constructor(private accountService: AccountService, private io: SocketIO) { }

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
      req.session.destroy(() => {
        console.log("Logout successful")
      })


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
      console.log(req.session.username)
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

  getProfilePic = async (req: Request, res: Response): Promise<void> => {
    try {
      if (req.session.id) {
        const username = req.session.username;
        const picResult = (await this.accountService.getPicResult(username)).rows[0];
        res.json(picResult)
      } else {
        res.status(400).json({ message: "You are not logged in." });
      }

    } catch (e) {
      console.error("error");
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  editProfilePic = async (req: Request, res: Response): Promise<void> => {
    try {
      const form = formidable({
        uploadDir: __dirname + "/../uploads",
        keepExtensions: true,
        minFileSize: 0,
        allowEmptyFiles: true,
      });
  
      let fields: { [key: string]: string } = {};
      let user: string = "";
  
      form.parse(req, async (err, _fields, files) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: "Internal server error!" });
          return;
        }
  
        user = req.params.username;
  
        if (files.p1) {
          fields.p1 = files.p1[0].newFilename;
        }
        if (files.p2) {
          fields.p2 = files.p2[0].newFilename;
        }
        if (files.p3) {
          fields.p3 = files.p3[0].newFilename;
        }
        if (files.p4) {
          fields.p4 = files.p4[0].newFilename;
        }
        if (files.p5) {
          fields.p5 = files.p5[0].newFilename;
        }
        if (files.p6) {
          fields.p6 = files.p6[0].newFilename;
        }
  
        const updateFields = Object.keys(fields)
          .map((key, index) => `${key} = $${index + 1}`)
          .join(", ");
        const values = Object.values(fields);
  
        const result = await this.accountService.editPicResult(updateFields,values,user)
  
        res.json({
          data: {
            result,
          },
        });
      });
    } catch (error) {
      console.error("Error editing profile picture:", error);
      res.status(500).json({ message: "Internal server error!" });
    }
  };
}
