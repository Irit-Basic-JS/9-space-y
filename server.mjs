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

app.use(express.static('spa/build')); //1
app.use(cookieParser()); //5
app.use(bodyParser.json());

app.get('', (req, res) => {
  res.send('spa/build/index.html')
});

//7
app.use((req, res, next) => {
  const path = req.path;
  if (!path.includes("/api") && !path.includes("/static") && path === "/login" && !req.cookies.username) {
      res.redirect("/");
  }
  next();
});

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

app.get("/api/login", (req,res)=>{
  console.log("api/login: start" );
  let username = req.query.username; 
  console.log("api/login: " + username);
  res.cookie('username', username);
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
})

app.get('/*', (req, res) => {
  res.redirect('/');
});


//7 task 
  

/*async function cookieValidator (cookies) {
  try {
    await externallyValidateCookie(cookies.testCookie)
  } catch {
    app.get('/*', (req, res) => {
      res.redirect('/');
    });
  }
}


async function validateCookies (req, res, next) {
  await cookieValidator(req.cookies)
  next()
}

app.use(cookieParser())

app.use(validateCookies)

// error handler
app.use(function (err, req, res, next) {
  res.status(400).send(err.message)
  
})
*/

//3 task
https.createServer(
  {
    key: fs.readFileSync("certs/server.key"),
    cert: fs.readFileSync("certs/server.cert"),
  },
  app
).listen(port, function () {
  console.log(`Я работаю на ${port}`);
});