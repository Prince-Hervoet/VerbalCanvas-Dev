export interface Command {
  command: string;
  args: number[];
}

export function isEmptyValue(value: any) {
  return value === null || value === undefined;
}

export function isEmptyValues(...values: any[]) {
  for (const value of values) {
    if (!isEmptyValue(value)) return false;
  }
  return true;
}

export function setAttrIfExist(
  target: any,
  key: string,
  value: any,
  defaultValue: any
) {
  if (!isObject(target)) return;
  if (key in target) target[key] = value ?? defaultValue;
}

export function isObject(val: any): val is Object {
  return val instanceof Object;
}

export function isPlainObject(obj: any) {
  return !!obj && obj.constructor === Object;
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
