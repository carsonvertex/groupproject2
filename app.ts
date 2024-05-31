import express from "express";
import expressSession from "express-session";
import dotenv from "dotenv";
import { accountRouter } from "./routers/account";
import { checkLoggedIn } from "./utils/guard";
import bodyParser from "body-parser";
// import { accountChat } from "./routers/chatbox";
import { Server, Socket, Server as SocketIO } from "socket.io";
import http from "http";
import cors from "cors";
import url from 'url';
import { pgClient } from "./pgClients";



declare module "express-session" {
  interface SessionData {
    userId: number;
    username: string;
    level: string;
  }
}

dotenv.config();

const app = express();
app.use(cors())
const server = new http.Server(app);
const io = new SocketIO(server);
const PORT = 8000;

if (!process.env.SECRET) throw Error("No Secret in .env");

app.use(
  expressSession({
    secret: process.env.SECRET,
    saveUninitialized: true,
    resave: true,
  })
);


io.on('connection', (socket) => {
  console.log('A user connected');
  // Fetch all the previous messages from the database
  async function getAllMessages() {
    try {
      const result = await pgClient.query(
        'SELECT conversation.text, users.username FROM conversation ' +
        'JOIN users ON conversation.userid = users.id ' +
        'ORDER BY conversation.id;'
      );

      const messages = result.rows.map(row => `${row.username}: ${row.text}`);
      socket.emit('all_messages', messages);
    } catch (err) {
      console.error('Error fetching messages from the database:', err);
    }
  }
  // Listen for chat messages from clients
  socket.on('message', async (msg) => {
    console.log('Received message:', msg);
    try {
      // Broadcast the message to all connected clients
      let URLusername = socket.handshake.headers.referer;
      if (URLusername) {
        const url = new URL(URLusername);
        const username = url.searchParams.get('user');
        console.log(username); // Output: 'user2'

        let userId = (await pgClient.query(
          'SELECT id FROM users WHERE username = $1;',
          [username]
        )).rows[0].id;
        console.log(userId)
        // Save the message to the PostgreSQL database
        await pgClient.query(
          'INSERT INTO conversation (userid, text) VALUES ($1, $2);',
          [userId, msg]
        );

        io.emit('chat_message', `${username}: ${msg}`);
      }
    } catch (err) {
      console.error('Error saving message to the database:', err);
    }
  });

    // Emit the last message when a new client connects
    getAllMessages();

  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

//parsing middleware
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

//api
app.use("/account", accountRouter);
// app.use("/onlyfun", accountChat)

//static assets
app.use(express.static("public/"));
app.use(express.static("uploads"));

app.get("/");

server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}/login.html`);
});
