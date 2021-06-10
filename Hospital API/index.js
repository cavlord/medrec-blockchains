const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const fabric = require("./fabric/controller.js");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => res.send("My first REST API!"));
app.post("/enroll-admin", fabric.enrollAdmin);
app.post("/register-user", fabric.registerEnrollUser);
app.get("/check", fabric.reserveconfirm);
app.put("/assign", fabric.assignDockter);
app.put("/diagnose", fabric.addDiagnose);
app.put("/therapy", fabric.addTherapy);
app.put("/drug", fabric.addDrug);
app.put("/end", fabric.EndReservation);

// app.get("/history", fabric.getHistoryForKey);

const port = 8001;
app.listen(port, () => {
  console.log("Listening on port " + port);
});
