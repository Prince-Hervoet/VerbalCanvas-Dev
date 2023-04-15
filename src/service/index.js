import util from "../util/index.js";
import getRedisClient from "../util/redis.js";
import { LessPriorityQueue } from "./lessPriorityQueue.js";

const NO_AUTHORIZE = "1";

const queue = new LessPriorityQueue((a, b) => {
  if (a.updateAt > b.updateAt) {
    return 1;
  } else if (a.updateAt < b.updateAt) {
    return -1;
  } else {
    return 0;
  }
});

const sessionIdToResponse = new Map();

export const WAITING_TINEOUT = 30000;

async function holdUserConnection(sessionId, res) {
  const rc = await getRedisClient();
  const value = rc.get(sessionId);
  if (value !== "no") {
    res.send(value);
    return;
  }
  const now = new Date().getTime();
  const resPackage = {
    updateAt: now,
    response: res,
    sessionId,
    isSent: false,
  };
  queue.add(resPackage);
  sessionIdToResponse[sessionId] = resPackage;
}

async function authorize(sessionId, userInfo) {
  const now = new Date().getTime();
  const value = sessionIdToResponse[sessionId];
  if (!value) {
    return { code: 4002, msg: "sessionId is unabled", data: undefined };
  }
  if (now - value.updateAt >= WAITING_TINEOUT) {
    value.response.send({ code: 4006, msg: "time out", data: undefined });
    sessionIdToResponse.delete(sessionId);
    return { code: 4002, msg: "anthorize failed,time out", data: undefined };
  }
  // 检查用户信息
  // 如果可以
  const code = util.getAuthorizeCode();
  const rc = await getRedisClient();
  rc.set(code, JSON.stringify(userInfo));
  value.response.send({ code: 4000, msg: "authorize success", data: { code } });
  value.isSent = true;
}

async function getToken(code, clientId) {}

function clearQueueAndMap() {
  console.log("asdfasdfsadf");
  let count = 16;
  const now = new Date().getTime();
  while (!queue.isEmpty() && count > 0) {
    --count;
    const resPackage = queue.peek();
    if (resPackage.isSent || now - resPackage.updateAt >= WAITING_TINEOUT) {
      queue.poll();
      sessionIdToResponse.delete(resPackage.sessionId);
    } else {
      break;
    }
  }
}

const service = {
  holdUserConnection,
  authorize,
  getToken,
  clearQueueAndMap,
};

export default service;
