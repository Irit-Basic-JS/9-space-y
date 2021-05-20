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

app.use(cookieParser());
app.use('static', express.static('spa/build'));

app.get("/client.mjs", (_, res) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.sendFile(path.join(rootDir, "client.mjs"), {
    maxAge: -1,
    cacheControl: false,
  });
});

app.use((req, res, next) => {
  const path = req.path;
  if (!path.includes("/api/")
    && path !== "/login"
    && !path.includes("/static/")
    && !req.cookies.username) {
    res.redirect("/login");
  }
  next();
},
);

app.get("/login", (_, res) => {
	res.sendFile(path.join(rootDir, 'spa/build/index.html'));
});

app.get('/api/login', (req, res) => {
  let username = req.query.username;
  res.cookie('username', username, {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
  });
  res.send('login by ' + username);
});

app.get('/api/logout', (req, res) => {
  res.clearCookie('username');
  res.sendStatus(200);
});

app.get('/api/user', (req, res) => {
  let username = req.cookies.username;
  if (!username) {
    res.sendStatus(404);
  }
  else {
    res.send(username);
  }
});

app.get('/api/info', async (req, res) => {
  const response = await fetch("https://api.spacexdata.com/v3/info");
  if (response.ok) {
    res.json(await response.json());
  } else {
    res.sendStatus(response.status);
  }
});

app.get('/api/history', async (req, res) => {
  const response = await fetch("https://api.spacexdata.com/v3/history");
  if (response.ok) {
    res.json(await response.json());
  } else {
    res.sendStatus(response.status);
  }
});

app.get('/api/history/event', async (req, res) => {
  let id = req.query.id;

  const response = await fetch(`https://api.spacexdata.com/v3/history/${req.query.id}`);
	if (response.ok) {
    res.json(await response.json());
  } else {
    res.sendStatus(response.status);
  }
});

app.get("/api/rockets", async (req, res) => {
	const response = await fetch("https://api.spacexdata.com/v3/rockets");
	if (response.ok) {
    res.json(await response.json());
  } else {
    res.sendStatus(response.status);
  }
});

app.get("/api/rockets/rocket/", async (req, res) => {
	const response = await fetch(`https://api.spacexdata.com/v3/rockets/${req.query.id}`);
	if (response.ok) {
    res.json(await response.json());
  } else {
    res.sendStatus(response.status);
  }
});

app.get("/api/roadster", async (req, res) => {
	const response = await fetch(`https://api.spacexdata.com/v3/roadster`);
	if (response.ok) {
    res.json(await response.json());
  } else {
    res.sendStatus(response.status);
  }
});

const marsItems = new Map();
let id = 1;

app.get("/api/mars-items", (req, res) => {
	const items = getItems(marsItems);
	res.json(items);
});

app.post("/api/mars-item", (req, res) => {
	const item = req.body;
	item.id = id;
	marsItems.set(id, item);
	id++;
	const items = getItems(marsItems);
	res.json(items);
	res.status(200);
});

app.delete("/api/mars-item", function (req, res) {
	const item = req.body;
	marsItems.delete(item.id);
	const items = getItems(marsItems);
	res.json(items);
	res.status(200);
});

function getItems(map) {
	const result = [];
	for (const pair of map.entries()) {
		result.push(pair[1]);
	}
	return result;
} 

app.get("/", (_, res) => {
  res.send(":)");
});

app.get("/*", (req, res) => {
  res.sendFile(path.join(rootDir, 'spa/build/index.html'));
});

https.createServer({
  key: fs.readFileSync('certs/server.key'),
  cert: fs.readFileSync('certs/server.cert')
}, app)
.listen(3000, function () {
  console.log('App listening at https://localhost:3000/');
});

