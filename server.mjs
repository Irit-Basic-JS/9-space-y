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
const publicAPI = "https://api.spacexdata.com/v3";

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static("spa/build"));

app.use((req, res, next) => {
    const path = req.path;
    if (!path.includes("/api/") && !path.includes("/static") && path === "/login" && !req.cookies.username) {
        res.redirect("/login");
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

app.get("/api/user", (req, res) => {
    res.send(req.cookies.username);
});

app.get("/api/login", (req, res) => {
    const userName = req.query.username;
    res.cookie("username", userName, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
    });
    res.send(userName);
});

app.get("/api/logout", (_, res) => {
    res.clearCookie("username");
    res.sendStatus(200);
})

app.get("/api/info", async (req, res) => {
    const info = await fetch(publicAPI + "/info");
    if (info.ok) {
        const json = await info.json();
        res.json(json);
    } else {
        res.status(info.status).end();
    }
});

app.get("/api/history", async (req, res) => {
    const info = await fetch(publicAPI + "/history");
    if (info.ok) {
        const json = await info.json();
        res.json(json);
    } else {
        res.status(info.status).end();
    }
});

app.get("/api/history/event", async (req, res) => {
    const id = req.query.id;
    const info = await fetch(publicAPI + `/history/${id}`);
    if (info.ok) {
        const json = await info.json();
        res.json(json);
    } else {
        res.status(info.status).end();
    }
});

app.get("/api/rockets", async (req, res) => {
    const info = await fetch(publicAPI + '/rockets');
    if (info.ok) {
        const json = await info.json();
        res.json(json);
    } else {
        res.status(info.status).end();
    }
});

app.get("/api/rocket", async (req, res) => {
    const id = req.query.id;
    const info = await fetch(publicAPI + `/rockets/${id}`);
    if (info.ok) {
        const json = await info.json();
        res.json(json);
    } else {
        res.status(info.status).end();
    }
});

app.get("/api/roadster", async (req, res) => {
    const info = await fetch(publicAPI + "/roadster");
    if (info.ok) {
        const json = await info.json();
        res.json(json);
    } else {
        res.status(info.status).end();
    }
});

app.get("/*", (_, res) => {
    res.sendFile(path.join(rootDir, "spa/build/index.html"));
});

https.createServer({
    key: fs.readFileSync("certs/server.key"),
    cert: fs.readFileSync("certs/server.cert"),
}, app).listen(port, function () {
    console.log(`App listening on port ${port}. Go to https://localhost:3000/`);
});