import QRCode from "qrcode";
import { nanoid } from "nanoid";

function createQrCode(content) {
  return new Promise((res, rej) => {
    QRCode.toDataURL(content, function (err, url) {
      if (err) {
        rej(err);
      } else {
        res(url);
      }
    });
  });
}

async function getAuthorizeCode() {
  const nowStr = new Date().getTime() + "";
  const buff = Buffer.from(nowStr, "utf-8");
  const base64Str = buff.toString("base64");
  return nanoid() + "_" + base64Str;
}

function verifyParams(params, rule) {}

const util = {
  createQrCode,
  getAuthorizeCode,
};

export default util;
