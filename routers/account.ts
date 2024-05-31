import { Router, Request, Response } from "express";
import { pgClient } from "../pgClients";
import { AccountController } from "../controllers/accountController";
import { Server as SocketIO } from "socket.io";
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
      `UPDATE users SET "verificationImages" = $1 WHERE username = $2;`,
      [imageName, username]
    );

    // Return a success response
    res.status(200).json({ message: 'Picture uploaded successfully!', soloFace: updatedVerifyImage});
  } catch (error) {
    console.error('Error uploading picture:', error);

    // Return an error response
    res.status(500).json({ error: 'An error occurred while uploading the picture. Please try again.' });
  }
}




