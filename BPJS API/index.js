const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const fabric = require("./fabric/controller.js");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => res.send("My first REST API!"));
app.post("/enroll-admin", fabric.enrollAdmin);
app.post("/register-user", fabric.registerEnrollUser);
app.post("/create", fabric.createMedRec);
app.put("/reservation", fabric.Reservation);
app.get("/get", fabric.getByID);
// app.get("/history", fabric.getHistoryForKey);

const port = 8000;
app.listen(port, () => {
  console.log("Listening on port " + port);
});
