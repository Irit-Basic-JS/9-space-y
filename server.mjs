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
const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(express.static('spa/build'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser())

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

app.get('/api/getUser/', urlencodedParser, (req, res) => {
  if (req.cookies.username) {
    res.send(req.cookies.username);
  }
  else {
    res.send('');
  }
})

app.get('/api/loginUser/:username', urlencodedParser, (req, res) => {
  const username = req.params.username;
  res.cookie("username", username, { httpOnly: true, secure: true, sameSite: 'strict' });
  res.send(username);
})

app.get('/api/logoutUser/', urlencodedParser, (_, res) => {
  res.clearCookie('username');
  res.redirect('/login');
})

app.get("*", (_, res) => {
  res.redirect('/');
});

https.createServer({
  key: fs.readFileSync('certs/server.key'),
  cert: fs.readFileSync('certs/server.cert')
}, app)
  .listen(port, function () {
    console.log('App listening https://localhost:3000/')
  })
