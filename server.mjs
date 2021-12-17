import * as path from "path";
import fs from "fs";
import express from "express";
import https from "https";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const rootDir = process.cwd();
const port = 1400;
const app = express();
const items = new Map([]);
let id = 0;

app.use(express.static('spa/build'));
app.use(bodyParser.json());
app.use(cookieParser());

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

app.post('/api/login/', (req, res) => {
    const username = req.query.username;
    res.cookie('username', username, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    });
    res.send(username);
  });

app.post('/api/logout/', (req, res) => {
    res.clearCookie('username');
    res.status(201).end();
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

app.get('/api/roadster', async (req, res) => {
    const info = await fetch('https://api.spacexdata.com/v3/roadster');
    if (info.ok) {
        const json = await info.json();
        res.json(json);
    } else {
        res.status(info.status).end();
    }
});

app.get("/api/sendToMars", (req, res) => {
    res.json(getResponse());
});

app.post("/api/sendToMars/send", (req, res) => {
    const item = req.body;
    item.id = id;
    items.set(id, item);
    id++;
    res.json(getResponse());
    res.status(200);
});

app.delete("/api/sendToMars/cancel", function (req, res) {
    items.delete(req.body.id);
    res.json(getResponse());
    res.status(200);
});

app.get("/*", (_, res) => {
    res.sendFile(path.join(rootDir, 'spa/build/index.html'));
});

https.createServer({
    key: fs.readFileSync('certs/server.key'),
    cert: fs.readFileSync('certs/server.cert')
}, app).listen(port, () => {
    console.log(`App listening on port ${port}( https://localhost:${port} )`);
});

function getResponse() {
    const response = [];
    items.forEach((value) => {
        response.push(value)
    });
    return response;
}