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
const items = new Map([]);
let id = 1;

const checkRedirect = function (req, res, next) {
    if (!req.cookies.username && req.path !== "/login") {
        res.redirect("/login");
    }
    next();
};

app.use(express.static('spa/build'));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(checkRedirect);

app.get("/client.mjs", (_, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.sendFile(path.join(rootDir, "client.mjs"), {
        maxAge: -1,
        cacheControl: false,
    });
});

app.get("/api/user", (req, res) => {
    const userName = req.cookies.username;
    res.send(userName);
});

app.get("/api/login", (req, res) => {
    const userName = req.query.username;
    res.cookie("username", userName, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
    });
    res.send(userName);
});

app.get("/login", (_, res) => {
    res.sendFile(path.join(rootDir, 'spa/build/index.html'));
});

app.get("/api/logout", (_, res) => {
    res.clearCookie("username");
    res.sendStatus(201);
});

app.get('/api/info', async (req, res) => {
    const info = await fetch('https://api.spacexdata.com/v3/info');
    if (info.ok) {
        const json = await info.json();
        res.json(json);
    } else {
        res.status(info.status).end();
    }
});

app.get('/api/history', async (req, res) => {
    const info = await fetch('https://api.spacexdata.com/v3/history');
    if (info.ok) {
        const json = await info.json();
        res.json(json);
    } else {
        res.status(info.status).end();
    }
});

app.get('/api/history/event/', async (req, res) => {
    const info = await fetch(`https://api.spacexdata.com/v3/history/${req.query.id}`);
    if (info.ok) {
        const json = await info.json();
        res.json(json);
    } else {
        res.status(info.status).end();
    }
});

app.get('/api/rockets', async (req, res) => {
    const info = await fetch('https://api.spacexdata.com/v3/rockets');
    if (info.ok) {
        const json = await info.json();
        res.json(json);
    } else {
        res.status(info.status).end();
    }
});

app.get('/api/rockets', async (req, res) => {
    const info = await fetch(`https://api.spacexdata.com/v3/rockets/${req.query.id}`);
    if (info.ok) {
        const json = await info.json();
        res.json(json);
    } else {
        res.status(info.status).end();
    }
});

app.get('/api/roadster', async (req, res) => {
    const info = await fetch('https://api.spacexdata.com/v3/roadster');
    if (info.ok) {
        const json = await info.json();
        res.json(json);
    } else {
        res.status(info.status).end();
    }
});

app.get("/api/item", (req, res) => {
    res.json(getData());
});

app.post("/api/item", (req, res) => {
    const item = req.body;
    item.id = id;
    items.set(id, item);
    id++;
    res.json(getData());
    res.status(200);
});

app.delete("/api/item", function (req, res) {
    items.delete(req.body.id);
    res.json(getData());
    res.status(200);
});

app.get("/*", (_, res) => {
    res.sendFile(path.join(rootDir, 'spa/build/index.html'));
});

https.createServer({
    key: fs.readFileSync('certs/server.key'),
    cert: fs.readFileSync('certs/server.cert')
}, app).listen(port, () => {
    console.log(`App listening on port ${port}`);
});

function getData() {
    const result = [];
    items.forEach((value) => {
        result.push(value)
    });
    return result;
}