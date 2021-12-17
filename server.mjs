import * as path from "path";
import fs from "fs";
import express from "express";
import https from "https";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

const rootDir = process.cwd();
const port = 3000;
const app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(function (req, res, next) {
    if (['/login', '/api', '/static', '/client.mjs']
        .some(url => req.path.startsWith(url)) || req.cookies.username) {
        next()
    } else {
        res.redirect('/login');
    }
})

app.use(express.static("spa/build"));

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
    res.json({'username': req.cookies.username});
});

app.get("/api/login", (req, res) => {
    let username = req.query.username;
    res.cookie("username", username);
    res.json({username})
});

app.get("/api/logout", (req, res) => {
    let username = req.cookies.username;
    res.clearCookie('username');
    res.json({username});
});

const mars_dict = {}

app.get("/api/user/sendToMars/get", (req, res) => {
    res.json(mars_dict[req.cookies.username] || []);
});

app.post("/api/user/sendToMars/send", (req, res) => {
    let username = req.cookies.username;

    if (!(username in mars_dict)) {
        mars_dict[username] = [];
    }
    mars_dict[username].push(req.body['item']);

    res.json(mars_dict[username]);
});

app.post("/api/user/sendToMars/cancel", (req, res) => {
    let username = req.cookies.username;

    if (username in mars_dict) {
        const index = mars_dict[username].indexOf(req.body['item']);
        mars_dict[username].splice(index, 1);
    }

    res.json(mars_dict[username]);
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
