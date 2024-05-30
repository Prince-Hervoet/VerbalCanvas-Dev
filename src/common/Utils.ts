import { Point } from "./MathUtils";

export const UNKNOWN_STR = "unknown";

export interface Command {
  command: string;
  args: number[];
}

/**
 * 判断值是否是null或者undefined
 * @param value
 * @returns
 */
export function isNullOrUndefined(value: any) {
  return value === null || value === undefined;
}

/**
 * 判断一组值是否都为null或者undefined
 * @param values
 * @returns
 */
export function isAllNullOrUndefined(...values: any[]) {
  for (const value of values) {
    if (!isNullOrUndefined(value)) return false;
  }
  return true;
}

/**
 * 对一个对象设置值，如果属性不存在则不会执行
 * @param target
 * @param key
 * @param value
 * @param defaultValue
 * @returns
 */
export function setAttrIfExist(
  target: any,
  key: string,
  value: any,
  defaultValue: any
) {
  if (!isObject(target)) return;
  if (key in target) target[key] = value ?? defaultValue;
}

/**
 * 判断是否是一个对象
 * @param val
 * @returns
 */
export function isObject(val: any): val is Object {
  return val instanceof Object;
}

/**
 * 判断是否是一个空对象
 * @param obj
 * @returns
 */
export function isPlainObject(obj: any) {
  return isObject(obj) && Object.keys(obj).length === 0;
}

/**
 * 判断对象是否有某个属性
 * @param obj
 * @param key
 * @returns
 */
export function hasProperty(obj: any, key: string): boolean {
  if (!isObject(obj)) return false;
  return key in obj;
}

/**
 * 创建一个canvas DOM
 * @returns
 */
export function createCanvasDom() {
  return document.createElement("canvas");
}

/**
 * 恢复canvas上下文的scale属性
 * @param ctx
 */
export function recoverContextScale(ctx: CanvasRenderingContext2D) {
  const current = ctx.getTransform();
  const rotateRad = Math.atan2(current.b, current.a);
  const mathCos = Math.cos(rotateRad);
  const scaleX = current.a / mathCos;
  const scaleY = current.d / mathCos;
  ctx.scale(1 / scaleX, 1 / scaleY);
}

/**
 * 获取canvas上下文的scale变换值
 * @param ctx
 * @returns
 */
export function getCtxTransformScale(ctx: CanvasRenderingContext2D) {
  const current = ctx.getTransform();
  const { a, b, d } = current;
  const rotateRad = Math.atan2(b, a);
  const scaleX = a / Math.cos(rotateRad);
  const scaleY = d / Math.cos(rotateRad);
  return [scaleX, scaleY];
}

// 解析SVG路径函数
export function parseSvgPath(path: string) {
  if (!path) return [];
  const commands: Command[] = [];
  const regex = /([a-df-zA-DF-Z])\s*([^a-df-zA-DF-Z\s]*)/g;
  let match;
  while ((match = regex.exec(path)) !== null) {
    const [_, command, params] = match;
    const args = params
      .trim()
      .split(/\s*,\s*|\s+/)
      .map(parseFloat);
    commands.push({ command, args });
  }
  return commands;
}

function padStart(
  input: string,
  targetLength: number,
  padString: string
): string {
  while (input.length < targetLength) {
    input = padString + input;
  }
  return input;
}

export function generateRandomHexColor(): string {
  // 生成随机的十六进制颜色值
  const randomHex = Math.floor(Math.random() * 16777215).toString(16);
  const hexColor = "#" + padStart(randomHex, 6, "0");
  return hexColor;
}

export function deepClone(obj: any) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  // 处理数组的情况
  if (Array.isArray(obj)) {
    const clonedArray: any[] = [];
    for (const item of obj) {
      clonedArray.push(deepClone(item));
    }
    return clonedArray;
  }
  // 处理对象的情况
  const clonedObj: { [key: string]: any } = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }
  return clonedObj;
}
