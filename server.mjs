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



const loginMiddleware = (req, res, next) => {
  const dontRedirect = ['api', 'static', 'login', 'client.mjs'];

  let route = req.url.split("/")[1];

  if (!req.cookies.username && !dontRedirect.includes(route)) {
    res.redirect("/login");
  } else {
    next(); 
  }
};

app.use(express.static('spa/build'));
app.use(cookieParser());
app.use(loginMiddleware);

app.get('/login', (req, res) => {
  res.sendFile(path.join(rootDir, "spa/build/index.html"));
});

app.get("/client.mjs", (_, res) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.sendFile(path.join(rootDir, "client.mjs"), {
    maxAge: -1,
    cacheControl: false,
  });
});

app.get("/api/login", (req, res) => {
  let username = req.query.username;
  res.cookie("username", username, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict'
  });
  res.json({'username': username});
});

app.get("/api/user", (req, res) => {
  let username = req.cookies.username;
  res.json({'username': username});
});

app.get("/api/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/");
});

app.get('/*', (req, res) => {
  res.redirect("/");
});

https.createServer(
  {
    key: fs.readFileSync("certs/server.key"),
    cert: fs.readFileSync("certs/server.cert"),
  },
  app
).listen(port, function () {
  console.log(`App listening on port ${port}`);
});
