import * as path from "path";
import fs from "fs";
import express from "express";
import https from "https";
import cookieParser from "cookie-parser";

const rootDir = process.cwd();
const port = 3000;
const app = express();

app.use(express.static("spa/build"));
app.use(cookieParser());
app.use((req, res, next) => {
    if (req.cookies.username ||
        req.path.startsWith("/api") ||
        req.path.startsWith("/static") ||
        req.path.startsWith("/login")) {
        next();
    } else {
        res.redirect("/login");
    }
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

app.get("/api/username", (req, res) => {
    res.send(req.cookies.username);
});

app.get("/api/login", (req, res) => {
    const username = req.query.username;
    res.cookie("username", username);
    res.send(username);
});

app.get("/api/logout", (req, res) => {
    res.clearCookie('username');
});

app.get("/*", (_, res) => {
    res.sendFile(path.join(rootDir, "spa/build/index.html"));
});

https.createServer({
    key: fs.readFileSync("certs/server.key"),
    cert: fs.readFileSync("certs/server.cert"),
}, app).listen(port, function () {
    console.log(`app on https://localhost:3000/`);
});
