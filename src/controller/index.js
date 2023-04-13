import util from "../util/index.js";

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
  console.log(req.query);
  if (!req || !req.query) {
    res.send({ code: 4001, msg: "params empty", data: undefined });
    return;
  }
  const data = await util.createQrCode("123123");
  res.send(data);
}

async function timeoutUserPitch(req, res) {}

const controller = {
  getQrCode,
};

export default controller;
