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

function loginMiddleware(req, res, next) {
  let notRedirectingUrls = ['static', 'login', 'api'];
  let root = req.url.split('/')[1];
  let isFile = root.split('.').length > 1;
  if (notRedirectingUrls.includes(root) || isFile || req.cookies.username)
    next();
  else
    res.redirect('/login');
};

app.use(express.static('spa/build'));
app.use(cookieParser());
app.use(loginMiddleware);

app.get("/client.mjs", (_, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.sendFile(path.join(rootDir, "client.mjs"), {
        maxAge: -1,
        cacheControl: false,
    });
});

app.get("/api/login", (req, res) => {
    res.cookie('username', req.query.username, { 'httpOnly': true, 'secure': true, 'sameSite': 'Strict' });
    res.json({ 'username': req.query.username });
});

app.get("/api/user", (req, res) => {
    res.json({ 'username': req.cookies.username });
});

app.get("/api/logout", (req, res) => {
    res.clearCookie('username');
    res.redirect('/');
})

app.get('/*', (req, res) => {
res.redirect('/');
});


https.createServer({
        key: fs.readFileSync("certs/server.key"),
        cert: fs.readFileSync("certs/server.cert"),
    },
    app
).listen(port, function() {
    console.log(`Я работаю на ${port}`);
});