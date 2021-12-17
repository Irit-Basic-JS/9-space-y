import * as path from "path";
import fs from "fs";
import express from "express";
import https from "https";
import cookieParser from "cookie-parser";

const rootDir = process.cwd();
const port = 3000;
const app = express();

/* --7-- */
const validUrls = ['login', 'api', 'static'];
const redirectingMiddleware = function (req, res, next) {
    const root = req.url.split('/')[1];
    const shouldBeSkipped = validUrls.includes(root);
    const isFile = path.extname(root) !== '';
    if (shouldBeSkipped || isFile || req.cookies.username) {
        return next()
    } else {
        res.redirect('/login');
    }
};

/* --1-- */
app.use(express.static('spa/build'));
/* --5-- */
app.use(cookieParser());
app.use(redirectingMiddleware);

app.get("/client.mjs", (_, res) => {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.sendFile(path.join(rootDir, "client.mjs"), {
        maxAge: -1,
        cacheControl: false,
    });
});

/* --4-- */
/* --6-- */
app.get('/api/login', (req, res) => {
    const username = req.query.username;
    res.cookie('username', username, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict'
    });
    res.json({ username });
});

app.get('/api/user', (req, res) => {
    const username = req.cookies.username;
    res.json({ username });
})

app.get('/api/logout', (req, res) => {
    res.clearCookie('username');
    res.redirect('/');
});

/* --2-- */
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(rootDir, 'spa', 'build', 'index.html'));
})

/* --3-- */
https.createServer({
    key: fs.readFileSync("certs/server.key"),
    cert: fs.readFileSync("certs/server.cert"),
}, app).listen(port);
