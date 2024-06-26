import { Router, Request, Response } from "express";
import { pgClient } from "../pgClients";
import { checkPassword, hashPassword } from "../utils/hash";
import { AccountController } from "../controllers/accountController";
import { Server as SocketIO } from "socket.io";
import formidable from "formidable";
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

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

accountRouter.get("/getProfilePic/:username", accountController.getProfilePic);
accountRouter.put("/editProfilePic/:username", accountController.editProfilePic)
accountRouter.post("/verification/:username", insertFaceID)
accountRouter.get("/chatFuntion/:username", onlyFun)
// accountRouter.post("/text/:username", storageText)

// async function storageText(req: Request, res: Response) {
//   try {
//     const { username, text } = req.body;
//     // const username = req.session.username;
//     console.log(username);

//     // let returningId = await pgClient.query(
//     //   "INSERT INTO conversation (userid,text) VALUES ($1) RETURNING id",
//     //   [username]
//     // );

//   } catch (error) {
//     console.error('trying', error);
//     res.status(500).json({ message: 'An error occurred while trying the user.' });
//   }
// }


async function onlyFun(req: Request, res: Response) {
  try {
    const username = req.session.username;
    console.log(username);

    let CheckVerifyImage = (await pgClient.query(
      `SELECT "verificationStatus" FROM users WHERE "username" = $1;`,
      [username]
    )).rows[0];

    let checkID = CheckVerifyImage.verificationStatus;
    if (checkID) {
      res.setHeader('Content-Type', 'application/json');
      res.status(200).json({ message: 'You are a real user!', user: CheckVerifyImage, username });
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({ message: 'You are not a real user!' });
    }
  } catch (error) {
    console.error('User not verified:', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({ message: 'An error occurred while verifying the user.' });
  }
}

// Function to convert base64 string to image and save it to a folder
async function saveBase64ToImage(base64: string, folderPath: string, fileName: string) {
  try {
    // Create the folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Decode the base64 string to a buffer
    const buffer = Buffer.from(base64, 'base64');

    // Construct the file path
    const filePath = path.join(folderPath, fileName);

    // Write the buffer to a files
    await fs.promises.writeFile(filePath, buffer);

    console.log(`Image saved to: ${filePath}`);
  } catch (error) {
    console.error('Error saving image:', error);
  }
}

async function insertFaceID(req: Request, res: Response) {
  try {
    const { picture } = req.body;
    console.log("This is ", picture);
    const username = req.session.username;
    // Do something with the uploaded picture, such as saving it to a database or processing it
    await saveBase64ToImage(picture, 'soloImages', username + '.png');
    let imageName = username + '.png'

    let updatedVerifyImage = await pgClient.query(
      `UPDATE users SET "verificationImages" = $1, "verificationStatus" = $2 WHERE username = $3;`,
      [imageName, "T", username]
    );

    // Return a success response
    res.status(200).json({ message: 'Picture uploaded successfully!', soloFace: updatedVerifyImage });
  } catch (error) {
    console.error('Error uploading picture:', error);

    // Return an error response
    res.status(500).json({ error: 'An error occurred while uploading the picture. Please try again.' });
  }
}


// async function getProfilePic(req: Request, res: Response) {
//   try {
//     if (req.session.id) {
//       const username = req.session.username;
//       const picResult = (await pgClient.query("SELECT p1,p2,p3,p4,p5,p6 FROM users WHERE username = $1", [username])).rows[0];
//       return res.json(picResult);
//     } else {
//       return res.status(400).json({ message: "You are not logged in." });
//     }

//   } catch (e) {
//     console.error("error");
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
// }

// async function editProfilePic(req: Request, res: Response) {
//   const form = formidable({
//     uploadDir: __dirname + "/../uploads",
//     keepExtensions: true,
//     minFileSize: 0,
//     allowEmptyFiles: true,
//   });

//   let fields: { [key: string]: string } = {};
//   let user: string = "";

//   form.parse(req, async (err, _fields, files) => {
//     if (err) {
//       console.log(err);
//       res.status(500).json({ message: "Internal server error!" });
//       return;
//     }

//     user = req.params.username;

//     if (files.p1) {
//       fields.p1 = files.p1[0].newFilename;
//     }
//     if (files.p2) {
//       fields.p2 = files.p2[0].newFilename;
//     }
//     if (files.p3) {
//       fields.p3 = files.p3[0].newFilename;
//     }
//     if (files.p4) {
//       fields.p4 = files.p4[0].newFilename;
//     }
//     if (files.p5) {
//       fields.p5 = files.p5[0].newFilename;
//     }
//     if (files.p6) {
//       fields.p6 = files.p6[0].newFilename;
//     }

//     const updateFields = Object.keys(fields)
//       .map((key, index) => `${key} = $${index + 1}`)
//       .join(", ");
//     const values = Object.values(fields);

//     const result = await pgClient.query(
//       `UPDATE users SET ${updateFields} WHERE username = $${values.length + 1}`,
//       [...values, user]
//     );

//     res.json({
//       data: {
//         result,
//       },
//     });
//   });
// }