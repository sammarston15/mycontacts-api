const express = require("express");
const session = require("express-session");
const massive = require("massive");
const cors = require("cors");
const path = require("path");
const controller = require("./ctrl");
require("dotenv").config();
const PORT = process.env.PORT || 8080;
const app = express();

// use massiveJS to connect to the db
const db = massive({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  ssl: true,
});

// set the db connection to the server's 'db' variable
app.set("db", db);

app.use(
  session({
    secret: "keyboard cat",
    expires: 864000000,
    maxAge: 864000000,
    resave: true,
    saveUninitialized: true,
  })
);

app.use(express.static(path.join(__dirname, '../build')));
app.use(express.json());
app.use(cors({ credentials: true, origin: "*" }));

// endpoints
app.get("/api/contacts", controller.getContacts);
app.post("/api/contacts", controller.newContact);
app.put("/api/contacts", controller.editContact);
app.put("/api/contacts/:id", controller.deleteContact);
app.post("/signup", controller.createSignup);
app.post("/login", controller.createLogin);

// this is a catch all so that your front end always shows up when hosted
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'))
  // res.sendFile('index.html', {root: 'public'});
})

// this is the listen for the port which heroku is giving your your server through the process.env.PORT
app.listen(PORT, () => console.log("ready!!"));
