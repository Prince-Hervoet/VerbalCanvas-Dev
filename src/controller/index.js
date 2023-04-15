import util from "../util/index.js";
import service from "../service/index.js";

async function getQrCode(req, res) {
  if (
    !req ||
    !req.query ||
    !util.verifyParams(
      ["response_type", "client_id", "redirect_uri", "scope"],
      req.query
    )
  ) {
    res.send({ code: 4001, msg: "params deficiency", data: undefined });
    return;
  }
  const sessionId = await util.getAuthorizeCode();
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
