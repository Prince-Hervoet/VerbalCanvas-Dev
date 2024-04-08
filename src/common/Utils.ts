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
