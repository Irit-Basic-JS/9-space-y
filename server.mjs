import * as path from "path";
import fs from "fs";
import express from "express";
import https from "https";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

const rootDir = process.cwd();
const port = 3000;
const app = express();
const notRedirectingUrls = ['login', 'api', 'static'];

app.use(express.static("spa/build"));
app.use(cookieParser());
app.use(bodyParser.json());

app.use(function (req, res, next) {
    const root = req.url.split('/')[1];
    const shouldBeSkipped = notRedirectingUrls.includes(root);
    const isFile = root.split('.').length > 1;
    const haveCookie = req.cookies.username !== undefined;
    if (shouldBeSkipped || isFile || haveCookie) {
        next()
    } else
        res.redirect('/login');
})

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
    res.send(req.cookies.username || null);
});

app.get("/api/login", (req, res) => {
    const username = req.query.username;
    res.cookie("username", username);
    res.send(username);
});

app.get("/api/logout", (req, res) => {
    res.clearCookie('username');
    res.status(201).end();
});

const mars = {}

app.post("/api/user/sendToMars/send", (req, res) => {
    const name = req.cookies.username;

    const item = req.body['item'];

    if (name in mars) {
        mars[name].push(item)
    } else {
        mars[name] = [item];
    }

    res.json(mars[name]);
});
app.post("/api/user/sendToMars/cancel", (req, res) => {
    const name = req.cookies.username;

    const item = req.body['item'];

    if (name in mars) {
        const index = mars[name].indexOf(item);
        mars[name].splice(index, 1);
    }

    res.json(mars[name]);
});
app.get("/api/user/sendToMars/get", (req, res) => {
    const name = req.cookies.username;

    res.json(mars[name] || []);
});

app.get("/*", (req, res) => {
    res.sendFile(path.join(rootDir, "spa/build/index.html"));
});

https.createServer({
    key: fs.readFileSync("certs/server.key"),
    cert: fs.readFileSync("certs/server.cert"),
}, app).listen(port, function () {
    console.log(`app on https://localhost:3000/`);
});