import * as path from "path";
import fs from "fs";
import express from "express";
import https from "https";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const items = new Map([]);
let id = 1;
const rootDir = process.cwd();
const port = 3000;
const app = express();

app.use(cookieParser());
app.use(express.static("spa/build"));
app.use(bodyParser.json());
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

app.get("/api/user", (req, res) => {
	const userName = req.cookies.username;
	res.send(userName);
});

app.get("/api/login", (req, res) => {
	const userName = req.query.username;
	res.cookie("username", userName, {
		httpOnly: true,
		secure: true,
		sameSite: "Strict",
	});
	res.send(userName);
});

app.get("/login", (_, res) => {
	res.sendFile(path.join(rootDir, "spa/build/index.html"));
});

app.get("/api/logout", (req, res) => {
	res.clearCookie("username");
	res.sendStatus(200);
});

app.get("/api/info", async (req, res) => {
	const response = await fetch("https://api.spacexdata.com/v3/info");
	if (response.ok) {
		const json = await response.json();
		res.json(json);
	} else {
		res.status(response.status);
	}
});

app.get("/api/history", async (req, res) => {
	const response = await fetch("https://api.spacexdata.com/v3/history");
	if (response.ok) {
		const json = await response.json();
		res.json(json);
	} else {
		res.status(response.status);
	}
});

app.get("/api/history/event/", async (req, res) => {
	const response = await fetch(`https://api.spacexdata.com/v3/history/${req.query.id}`);
	if (response.ok) {
		const json = await response.json();
		res.json(json);
	} else {
		res.status(response.status);
	}
});

app.get("/api/rockets", async (req, res) => {
	const response = await fetch("https://api.spacexdata.com/v3/rockets");
	if (response.ok) {
		const json = await response.json();
		res.json(json);
	} else {
		res.status(response.status);
	}
});

app.get("/api/rockets/rocket/", async (req, res) => {
	const response = await fetch(`https://api.spacexdata.com/v3/rockets/${req.query.id}`);
	if (response.ok) {
		const json = await response.json();
		res.json(json);
	} else {
		res.status(response.status);
	}
});

app.get("/api/roadster", async (req, res) => {
	const response = await fetch(`https://api.spacexdata.com/v3/roadster`);
	if (response.ok) {
		const json = await response.json();
		res.json(json);
	} else {
		res.status(response.status);
	}
});

app.get("/api/item", (req, res) => {
	const values = getValues(items);
	res.json(values);
});

app.post("/api/item", (req, res) => {
	const item = req.body;
	item.id = id;
	items.set(id, item);
	id++;
	const values = getValues(items);
	res.json(values);
	res.status(200);
});

app.delete("/api/item", function (req, res) {
	const item = req.body;
	items.delete(item.id);
	const values = getValues(items);
	res.json(values);
	res.status(200);
});

app.get("/*", (req, res) => {
	res.sendFile(path.join(rootDir, "spa/build/index.html"));
});

https.createServer({
	key: fs.readFileSync("certs/server.key"),
	cert: fs.readFileSync("certs/server.cert"),
}, app).listen(port, () => {
	console.log(`App listening on port ${port}`);
});

function getValues(map) {
	const result = [];
	for (const pair of map.entries()) {
		result.push(pair[1]);
	}
	return result;
}