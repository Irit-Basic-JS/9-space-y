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

//const notRedirectingUrls = ['login', 'api', 'static'];
const loginMiddleware = function(req, res, next) {
    const root = req.url.split('/')[1];
    const shouldBeSkipped = notRedirectingUrls.includes(root);
    const isFile = root.split('.').length > 1;
    const haveCookie = req.cookies.username !== undefined;
    if (shouldBeSkipped || isFile || haveCookie)
        next()
    else
        res.redirect('/login');
};

app.use(express.static('spa/build')); //1
app.use(cookieParser()); //5
//app.use(loginMiddleware); //7

app.get('', (req, res) => {
    res.send('spa/build/index.html')
});

const notRedirectingUrls = ['login', 'api', 'static'];
app.get('/*', (req, res, next) => {
    const root = req.url.split('/')[1];
    const shouldBeSkipped = notRedirectingUrls.includes(root);
    const isFile = root.split('.').length > 1;
    const haveCookie = typeof(req.cookies.username) !== 'undefined';

    if (!shouldBeSkipped && !isFile && !haveCookie)
        res.redirect('/login');

    else
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

app.get("/api/login", (req, res) => {
    console.log("api/login: start");
    let username = req.query.username;
    console.log("api/login: " + username);
    res.cookie('username', username, { 'httpOnly': true, 'secure': true, 'sameSite': 'Strict' });
    res.json({ 'username': username });
});

app.get("/api/user", (req, res) => {
    let username = req.cookies.username;
    console.log("api/user: " + username);
    res.json({ 'username': username });
});

app.get("/api/logout", (req, res) => {
    console.log('api/logout: start');
    res.clearCookie('username');
    res.redirect('/');
})

// 8
app.get("/api/sendToMars", (req, res) => {

    //res.json(...response)
});

//app.get('/*', (req, res) => {
//res.redirect('/');
//});


//3 task
https.createServer({
        key: fs.readFileSync("certs/server.key"),
        cert: fs.readFileSync("certs/server.cert"),
    },
    app
).listen(port, function() {
    console.log(`Я работаю на ${port}`);
});