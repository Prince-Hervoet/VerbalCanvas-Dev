import express from "express";
import controller from "./controller/index.js";
const app = express();

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
