import express from "express";
import controller from "./controller/index.js";
import service from "./service/index.js";
const app = express();

setInterval(() => {
  service.clearQueueAndMap();
}, 5000);

app.get("/getQrCode", controller.getQrCode);

app.get("/authorize", (req, res) => {
  res.send("Hello World!");
});

app.get("/token", (req, res) => {
  res.send("Hello World!");
});

app.post("/timeoutUserPitch", (req, res) => {
  console.log("adfasdfasf");
  res.send("Hello World!");
});

app.post("/checkToken", (req, res) => {
  res.send("Hello World!");
});

app.listen(6799, () => {
  console.log("listening at 6799: " + "http://localhost:6799");
});
