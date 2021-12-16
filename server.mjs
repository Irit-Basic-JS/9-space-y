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
const peopleToMars = {};
let index = 0;

const checkLogin = function (req, res, next) {
    const path = req.path;
    if (path !== '/login' && !req.cookies.username)
        res.redirect('/login');

    next();
};

app.use(express.static('spa/build')); //1
app.use(cookieParser()); //5
app.use(bodyParser.json()); //7

app.get('', (req, res) => {
    res.send('spa/build/index.html')
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
    const username = req.query.username;
    res.cookie('username', username, { httpOnly: true, secure: true, sameSite: 'Strict' });
    res.send(username);
});

app.get("/api/logout", (req, res) => {
    res.clearCookie('username');
    res.sendStatus(200)
})

app.get("/api/user", (req, res) => {
    res.send(req.cookies.username);
});

// 8
app.get("/api/sendToMars", (req, res) => {
    let answer = [];
    for (let i in peopleToMars)
        answer.push(peopleToMars[i])

    res.json(answer);
});

app.post("/api/sendToMars", (req, res) => {
    const item = req.body;
    item['id'] = index;
    peopleToMars[index++] = item;
    let answer = [];
    for (let i in peopleToMars)
        answer.push(peopleToMars[i])

    res.json(answer);
});

app.delete("/api/sendToMars", (req, res) => {
    const item = req.body;
    delete peopleToMars[item.id];
    let answer = [];
    for (let i in peopleToMars)
        answer.push(peopleToMars[i])

    res.json(answer);
});
//8

app.use(checkLogin);
app.get('/*', (req, res) => {
    res.sendFile(path.join(rootDir, 'spa/build/index.html'));
});

//3 task
https.createServer({
        key: fs.readFileSync("certs/server.key"),
        cert: fs.readFileSync("certs/server.cert"),
    },
    app
).listen(port, function() {
    console.log(`Я работаю здесь: https://localhost:${port}`);
});