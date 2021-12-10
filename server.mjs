import * as path from "path";
import fs from "fs";
import express from "express";
import https from "https";
import cookieParser from "cookie-parser";

const rootDir = process.cwd();
const port = 3000;
const app = express();

const notRedirectingUrls = ['login', 'api', 'static'];
const loginMiddleware = function (req, res, next) {
    const root = req.url.split('/')[1];
    const shouldBeSkipped = notRedirectingUrls.includes(root);
    const isFile = root.split('.').length > 1;
    const haveCookie = req.cookies.username !== undefined;
    if (shouldBeSkipped || isFile || haveCookie) {
        next()
    } else
        res.redirect('/login');
};

app.use(express.static('spa/build')); //1
app.use(cookieParser()); //5
app.use(loginMiddleware); //7

app.get('/login', (req, res) => {
    res.sendFile(path.join(rootDir, "spa/build/index.html"), {
        maxAge: -1,
        cacheControl: false,
    });
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

app.get("/api/login", (req, res) => {
    let username = req.query.username;
    res.cookie('username', username, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
    });
    res.json({'username': username});
});

app.get("/api/user", (req, res) => {
    let username = req.cookies.username;
    res.json({'username': username});
});

app.get("/api/logout", (req, res) => {
    res.clearCookie('username');
    res.redirect('/');
});

app.get('/*', (req, res) => {
    res.redirect('/');
});

https.createServer(
    {
        key: fs.readFileSync("certs/server.key"),
        cert: fs.readFileSync("certs/server.cert"),
    },
    app
).listen(port, function () {
    console.log(`Я работаю на ${port}`);
});