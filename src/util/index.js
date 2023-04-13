import QRCode from "qrcode";
import { nanoid } from "nanoid";

const tokenSaltOne = "Y^D;;lJp~+?Uz#2wJep5LE`}?D1Egb8e";
const tokenSaltTwo = "[dX41o{1u>J,bt7V:=O52x`4afH12/!Q-gM1";

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

const util = {
  createQrCode,
  getAuthorizeCode,
};

export default util;
