
import express from "express";

const app = express();
const PORT = 8000;

app.get("/", function (req, res) {
  res.send("Hello World");
});

app.listen(PORT, ()=> {
  console.log(`http://localhost:${PORT}`);
});