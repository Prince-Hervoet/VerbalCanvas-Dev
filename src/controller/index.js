import util from "../util/index.js";
import service from "../service/index.js";

// var obj = new WxLogin({
//     self_redirect:true,
//     id:"login_container",
//     appid: "",
//     scope: "",
//     redirect_uri: "",
//      state: "",
//     style: "",
//     href: ""
//     });
async function getQrCode(req, res) {
  if (!req || !req.query) {
    res.send({ code: 4001, msg: "params empty", data: undefined });
    return;
  }
  const sessionId = await util.getAuthorizeCode();
  const sessionData = { sessionId };
  const data = await util.createQrCode(sessionId);
  res.send(data);
}

async function timeoutUserPitch(req, res) {
  if (!util.verifyParams(["sessionId"], req.query))
    res.send({ code: 4002, msg: "params error", data: undefined });
  service.holdUserConnection(req.query.sessionId, res);
}

const controller = {
  getQrCode,
};

export default controller;
