import * as path from "path";
import fs from "fs";
import express from "express";
import https from "https";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const rootDir = process.cwd();
const port = 3000;
const app = express();

app.use(cookieParser());

app.use(express.static('spa/build'));

app.get("/api/user", (req, res) => {
  res.send(req.cookies.username);
});

app.get("/api/login", (req, res) => {
  const username = req.query.username;
  res.cookie("username", username, {httpOnly: true, secure: true, sameSite: 'Strict'});
  res.send(username);
});

app.get("/api/logout", (req, res) => {
  res.clearCookie("username");
  res.sendStatus(200);
});

app.use('/', express.static('spa/build'));

app.get("/client.mjs", (_, res) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.sendFile(path.join(rootDir, "client.mjs"), {
    maxAge: -1,
    cacheControl: false,
  });
});

app.get("/", (_, res) => {
  res.send(":)");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

app.get(/\//, (req, res) => {
  res.redirect("index.html");
});

  https.createServer({
    key: fs.readFileSync('certs/server.key'),
    cert: fs.readFileSync('certs/server.cert')
}, app)
.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
