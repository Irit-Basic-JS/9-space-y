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

app.use(express.static('spa/build'));
app.use(cookieParser())
app.use(bodyParser.json());

https.createServer({
    key: fs.readFileSync('certs/server.key'),
    cert: fs.readFileSync('certs/server.cert')
}, app)
    .listen(port, function () {
        console.log(`App listening on port ${port}. Go to https://localhost:3000`)
    })

app.get("/client.mjs", (_, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.sendFile(path.join(rootDir, "client.mjs"), {
        maxAge: -1,
        cacheControl: false,
    });
});

app.use((req, res, next) => {
        if (!req.path.includes("/api/") && 
            req.path !== "/login" && 
            !req.path.includes("/static/") && 
            !req.cookies.username)
            res.redirect("/login");
        next();
    },
);

app.get("/", (_, res) => {
    res.sendFile(path.join(process.cwd(), "spa/build/index.html"));
});

app.get("/login", (_, res) => {
    res.sendFile(path.join(rootDir, "spa/build/index.html"));
});

app.get("/api/profile", (req, res) => {
    res.send(req.cookies.username);
});

app.get("/api/login", (req, res) => {
    let username = req.query.username;
    res.cookie("username", username, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict"
    });
    res.send(username);
});

app.get("/api/logout", (req, res) => {
    res.clearCookie("username");
    res.sendStatus(200);
});

app.get("/api/about", async (req, res) => {
    let response = await fetch("https://api.spacexdata.com/v3/info");
    response.ok
        ? res.json(await response.json())
        : res.status(response.status);
});

app.get("/api/history", async (req, res) => {
    let response = await fetch("https://api.spacexdata.com/v3/history");
    response.ok
        ? res.json(await response.json())
        : res.status(response.status);
});

app.get("/api/event/", async (req, res) => {
    let response = await fetch(`https://api.spacexdata.com/v3/history/${req.query.id}`);
    response.ok
        ? res.json(await response.json())
        : res.status(response.status);
});

app.get("/api/rockets", async (req, res) => {
    let response = await fetch("https://api.spacexdata.com/v3/rockets");
    response.ok
        ? res.json(await response.json())
        : res.status(response.status);
});

app.get("/api/rocket/", async (req, res) => {
    let response = await fetch(`https://api.spacexdata.com/v3/rockets/${req.query.id}`);
    response.ok
        ? res.json(await response.json())
        : res.status(response.status);
});

app.get("/api/roadster/", async (req, res) => {
    let response = await fetch(`https://api.spacexdata.com/v3/roadster`);
    response.ok
        ? res.json(await response.json())
        : res.status(response.status);
});

app.get("*", (_, res) => {
    res.redirect('/')
});