
import express from "express";
import expressSession from "express-session";
import dotenv from "dotenv";
import { accountRouter } from "./routers/account";
import { checkLoggedIn } from "./utils/guard";

declare module "express-session" {
    interface SessionData {
        userId: number;
        username: string;
        level:string;
    }
}

dotenv.config()

const app = express();
const PORT = 8000;

if (!process.env.SECRET)
    throw Error("No Secret in .env");

app.use(
    expressSession({        
        secret: process.env.SECRET,
        saveUninitialized: true,
        resave: true,
    })
);

 //parsing middleware
app.use(express.json())
app.use(express.urlencoded({extended:true}))

//api
app.use("/account", accountRouter);

//static assets
app.use(express.static('public/'))
app.use(express.static("uploads"))

app.get("/");


app.listen(PORT, ()=> {
  console.log(`http://localhost:${PORT}/login.html`);
});