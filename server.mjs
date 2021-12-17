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
const notRedirectingUrls = ['login', 'api', 'static'];

app.use(express.static('spa/build'))
app.use(cookieParser());

app.get('/*', (req, res, next) => {
  const root = req.url.split('/')[1];
  const shouldBeSkipped = notRedirectingUrls.includes(root);
  const isFile = root.split('.').length > 1;
  const haveCookie = typeof(req.cookies.username) !== 'undefined';

  if (!shouldBeSkipped && !isFile && !haveCookie)
      res.redirect('/login');
  else next();
});

app.get("/client.mjs", (_, res) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.sendFile(path.join(rootDir, "client.mjs"), {
    maxAge: -1,
    cacheControl: false,
  });
});

app.get("/api/login", (req,res)=>{
  console.log("api/login: start" );
  let username = req.query.username; 
  console.log("api/login: " + username);
  res.cookie('username', username, {httpOnly : true, secure : true, sameSite : "strict"});
  res.json({'username':username});
});

app.get("/api/user", (req, res) => {
  let username = req.cookies.username; 
  console.log("api/user: " + username);
  res.json({'username':username});
});

app.get("/api/logout", (req, res)=>{
  console.log('api/logout: start');
  res.clearCookie('username');
  res.redirect('/');
});

app.get('/*', (_, res) => {
  res.redirect('/');
});

https
  .createServer(
    {
      key: fs.readFileSync("certs/server.key"),
      cert: fs.readFileSync("certs/server.cert"),
    },
    app
  )
  .listen(port, function() {
    console.log(`Port is ${port}`)
  })