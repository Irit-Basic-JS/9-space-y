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
const items = {};
let id = 0;

let checkLogin = function (req, res, next) {
    const path = req.path;
    if (path !== "/login" && !req.cookies.username) {
        res.redirect("/login");
    }
    next();
};

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('spa/build'));


app.get("/client.mjs", (_, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.sendFile(path.join(rootDir, "client.mjs"), {
        maxAge: -1,
        cacheControl: false,
    });
});


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

app.get('/api/info', async (req, res) => {
    const info = await fetch('https://api.spacexdata.com/v3/info');
    if (info.ok){
        const json = await info.json();
        res.json(json);
    }else{
        res.status(info.status).end();
    }
});

app.get('/api/history', async (req, res) => {
    const info = await fetch('https://api.spacexdata.com/v3/history');
    if (info.ok){
        const json = await info.json();
        res.json(json);
    }else{
        res.status(info.status).end();
    }
});

app.get('/api/history/event', async (req, res) => {
    const id = req.query.id;
    const info = await fetch(`https://api.spacexdata.com/v3/history/${id}`);
    if (info.ok){
        const json = await info.json();
        res.json(json);
    }else{
        res.status(info.status).end();
    }
});

app.get('/api/rockets', async (req, res) => {
    const info = await fetch('https://api.spacexdata.com/v3/rockets');
    if (info.ok){
        const json = await info.json();
        res.json(json);
    }else{
        res.status(info.status).end();
    }
});

app.get('/api/rocket', async (req, res) => {
    const id = req.query.id;
    const info = await fetch(`https://api.spacexdata.com/v3/rockets/${id}`);
    if (info.ok){
        const json = await info.json();
        res.json(json);
    }else{
        res.status(info.status).end();
    }
});

app.get('/api/roadster', async (req, res) => {
    const info = await fetch(`https://api.spacexdata.com/v3/roadster`);
    if (info.ok){
        const json = await info.json();
        res.json(json);
    }else{
        res.status(info.status).end();
    }
});

app.get("/api/item", (req, res) => {
    let answer = [];
    for (let i in items) {
        answer.push(items[i])
    }
    res.json(answer);
});

app.post("/api/item", (req, res) => {
    const item = req.body;
    item["id"] = id;
    items[id] = item;
    id++;
    let answer = [];
    for (let i in items) {
        answer.push(items[i])
    }
    res.json(answer);
    res.status(200);
});

app.delete("/api/item", function (req, res) {
    const item = req.body;
    delete items[item.id];
    let answer = [];
    for (let i in items) {
        answer.push(items[i])
    }
    res.json(answer);
    res.status(200);
});

app.use(checkLogin);
app.get("/*", (_, res) => {
    res.sendFile(path.join(rootDir, 'spa/build/index.html'));
});

https.createServer({
    key: fs.readFileSync('certs/server.key'),
    cert: fs.readFileSync('certs/server.cert')
}, app).listen(port, () => {
    console.log(`App listening on port ${port}`);
});