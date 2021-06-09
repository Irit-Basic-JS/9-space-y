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
app.use(express.static('spa/build'));
let apiPath = /\/api\//;
let staticPath = /\/static\//;
app.get("/client.mjs", (_, res) => {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.sendFile(path.join(rootDir, "client.mjs"), {
    maxAge: -1,
    cacheControl: false,
  });
});
let loginTest = function (req, res, next) {
  const path = req.path;
  if (!(apiPath.test(path) || path === "/login" || staticPath.test(path)) && !req.cookies.username){
    res.redirect("/login");
  }
  next()
}

app.use(loginTest);

app.get("/api/user",(req,res)=>{
  const userName = req.cookies.username;
  res.send(userName);
})

app.get("/api/login",(req,res) =>{
  const userName = req.query.username;
  res.cookie("username",userName, {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict'
  });
  res.send(userName);
});

app.get("/login", (_, res) => {
  res.sendFile(path.join(rootDir, 'spa/build/index.html'))
});

app.get("/api/logout", (req, res) => {
  res.clearCookie("username");
  res.sendStatus(200);
});

app.get('/api/info', async (req, res) => {
  const info = await fetch('https://api.spacexdata.com/v3/info');
  if (info.ok){
    const json = await info.json();
    res.json({
      founder: json.founder,
      founded: json.founded,
      employees: json.employees,
      ceo: json.ceo,
      coo: json.coo,
      cto: json.cto,
      valuation: json.valuation,
      headquarters: json.headquarters,
      summary: json.summary
    });
  }else{
    res.status(info.status).end();
  }
})

app.get('/api/history', async (req, res) =>{
  const history = await fetch('https://api.spacexdata.com/v3/history');
  if (history.ok){
    const json = await history.json();
    res.json(json.map(event=>{
      return{
        id: event.id,
        title: event.title
      }
    }));
  }else{
    res.status(history.status).end();
  }
});

app.get('/api/history/event/', async (req, res) => {
  const historyEvent = await fetch(`https://api.spacexdata.com/v3/history/${req.query.id}`);
  if (historyEvent.ok){
    const json = await historyEvent.json();
    res.json({
      details: json.details,
      event_date_utc: json.event_date_utc,
      id: json.id,
      links: json.links,
      title: json.title
    });
  }else{
    res.status(historyEvent.ok).end();
  }
});

app.get('/api/rockets', async (req, res) => {
  const rockets = await fetch('https://api.spacexdata.com/v3/rockets');
  if (rockets.ok){
    const json = await rockets.json();
    res.json(json.map(e => {
      console.log(e.rocket_id, e.rocket_name);
      return {
        rocket_id: e.rocket_id,
        rocket_name: e.rocket_name,
      };
    }));
  }else{
    res.status(rockets.status).end();
  }
});

app.get('/api/rockets/rocket/', async (req, res) => {
  const rocket = await fetch(`https://api.spacexdata.com/v3/rockets/${req.query.id}`);
  if(rocket.ok){
    const json = await rocket.json();
    res.json({
      rocket_id: json.id,
      rocket_name: json.rocket_name,
      first_flight: json.first_flight,
      description: json.description,
      wikipedia: json.wikipedia,
      flickr_images: json.flickr_images,
      height: json.height,
      diameter: json.diameter,
      mass: json.mass,
      engines: json.engines,
      first_stage: json.first_stage,
      second_stage: json.second_stage,
      }
    );
  }else{
    res.status(rocket.status).end();
  }
});

app.get('/api/roadster', async (req, res)=>{
  const roadster = await fetch(`https://api.spacexdata.com/v3/roadster`);
  if(roadster.ok){
    const json = await roadster.json();
    res.json({
      name: json.name,
      launch_date_utc: json.launch_date_utc,
      details: json.details,
      earth_distance_km: json.earth_distance_km,
      mars_distance_km: json.mars_distance_km,
      wikipedia: json.wikipedia
    });
  }else{
    res.status(roadster.status).end();
  }
});

app.get("/*",(req,res)=>{
  res.sendFile(path.join(rootDir,'spa/build/index.html'));
});

https.createServer({
  key: fs.readFileSync('certs/server.key'),
  cert: fs.readFileSync('certs/server.cert')
},app).listen(port, () => {
  console.log(`App listening on port ${port}`);
});
