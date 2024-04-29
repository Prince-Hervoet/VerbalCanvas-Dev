import { nanoid } from "nanoid";

export const CAL_TEMP_1 = Math.PI / 180;
export const CAL_TEMP_2 = 180 / Math.PI;
export const CAL_TEMP_3 = Math.PI * 2;

/**
 * 点
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * 向量
 */
export interface Vector2 {
  start: Point;
  end: Point;
}

/**
 * 控制点位
 */
export enum CtrlCornerIndex {
  TOP_LEFT,
  TOP_RIGHT,
  BOTTOM_RIGHT,
  BOTTOM_LEFT,
  ROTATE_POINT,
  TOP_CENTER,
  RIGHT_CENTER,
  BOTTOM_CENTER,
  LEFT_CENTER,
}

export const ZeroOneVector2: Vector2 = {
  start: { x: 0, y: 0 },
  end: { x: 0, y: -1 },
};

/**
 * 获取widget唯一id
 * @returns
 */
export function getNanoId(): string {
  return nanoid();
}

/**
 * 获取两点之间的距离
 * @param p1
 * @param p2
 * @returns
 */
export function getDistanceBetweenPoints(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 射线法检测点是否在多边形中
 * @param point
 * @param vertices
 * @returns
 */
export function isPointInPolygon(point: Point, vertices: Point[]): boolean {
  let inside = false;
  const len = vertices.length;
  for (let i = 0, j = len - 1; i < len; j = i++) {
    const xi = vertices[i].x;
    const yi = vertices[i].y;
    const xj = vertices[j].x;
    const yj = vertices[j].y;
    const intersect =
      yi > point.y != yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * 检测点是否在圆形中
 * @param point
 * @param center
 * @param radius
 * @returns
 */
export function isPointInCircle(
  point: Point,
  center: Point,
  radius: number
): boolean {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  const distSquared = dx * dx + dy * dy;
  const radSquared = radius * radius;
  return distSquared <= radSquared;
}

/**
 * 检测点是否在椭圆中
 * @param point
 * @param radiusX
 * @param radiusY
 * @param center
 * @returns
 */
export function isPointInEllipse(
  point: Point,
  radiusX: number,
  radiusY: number,
  center: Point,
  rotate: number,
  isAngleRadians: boolean = false
): boolean {
  let rotateRad = rotate;
  if (!isAngleRadians) rotateRad = degreesToRadians(rotate);
  const mathCos = Math.cos(rotateRad);
  const mathSin = Math.sin(rotateRad);
  const { x, y } = point;
  const translatedX = mathCos * (x - center.x) + mathSin * (y - center.y);
  const translatedY = -mathSin * (x - center.x) + mathCos * (y - center.y);
  const normalizedX = translatedX / radiusX; // 归一化 x 坐标
  const normalizedY = translatedY / radiusY; // 归一化 y 坐标
  const distanceFromCenterSquared =
    normalizedX * normalizedX + normalizedY * normalizedY; // 到椭圆中心的距离的平方
  return distanceFromCenterSquared <= 1; // 如果点到椭圆中心的距离的平方小于等于 1，则点在椭圆内部，返回 true，否则返回 false
}

/**
 * 一个点绕另一个点旋转一定角度之后的点
 * @param point
 * @param center
 * @param angle
 * @param isAngleRadians
 * @returns
 */
export function rotatePoint(
  point: Point,
  center: Point,
  angle: number,
  isAngleRadians: boolean = false
): Point {
  if (angle === 0) return { x: point.x, y: point.y };
  if (!isAngleRadians) angle = angle * CAL_TEMP_1;
  const mathCos = Math.cos(angle);
  const mathSin = Math.sin(angle);
  const x =
    (point.x - center.x) * mathCos - (point.y - center.y) * mathSin + center.x;
  const y =
    (point.x - center.x) * mathSin + (point.y - center.y) * mathCos + center.y;
  return { x, y };
}

/**
 * 角度转弧度
 * @param degrees
 * @returns
 */
export function degreesToRadians(degrees: number): number {
  return degrees * CAL_TEMP_1;
}

/**
 * 弧度转角度
 * @param radians
 * @returns
 */
export function radiansToDegrees(radians: number): number {
  return radians * CAL_TEMP_2;
}

/**
 * 根据点数组求出最小包围盒数组
 * @param vertices
 * @returns
 */
export function getVerticesMinBoundingBox(vertices: Point[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  if (vertices.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  let minX = vertices[0].x;
  let minY = vertices[0].y;
  let maxX = vertices[0].x;
  let maxY = vertices[0].y;
  for (let i = 1; i < vertices.length; i++) {
    const { x, y } = vertices[i];
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  return { minX, minY, maxX, maxY };
}

/**
 * 判断两个矩形是否有包含关系
 * @param rectPoints1
 * @param rectPoints2
 * @returns
 */
export function isRectContain(
  rectPoints1: Point[],
  rectPoints2: Point[]
): boolean {
  const rect1Bounds = getVerticesMinBoundingBox(rectPoints1);
  const rect2Bounds = getVerticesMinBoundingBox(rectPoints2);
  if (
    !(
      rect2Bounds.minX > rect1Bounds.maxX ||
      rect2Bounds.maxX < rect1Bounds.minX ||
      rect2Bounds.minY > rect1Bounds.maxY ||
      rect2Bounds.maxY < rect1Bounds.minY
    )
  ) {
    for (const point of rectPoints2) {
      if (!isPointInPolygon(point, rectPoints1)) return false;
    }
    return true;
  }
  return false;
}

/**
 * 获取常规矩形的包围盒点数组
 * @param x
 * @param y
 * @param width
 * @param height
 * @returns
 */
export function getCommonRectVertices(
  x: number,
  y: number,
  width: number,
  height: number
) {
  const points1: Point[] = [];
  const temp1 = x + width;
  const temp2 = y + height;
  points1.push({ x, y });
  points1.push({ x: temp1, y });
  points1.push({ x: temp1, y: temp2 });
  points1.push({ x, y: temp2 });
  return points1;
}

/**
 * 检测点是否在线段上
 * @param point
 * @param start
 * @param end
 * @param lineWidth
 * @returns
 */
export function isPointOnLine(
  point: Point,
  start: Point,
  end: Point,
  lineWidth: number
): boolean {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const segmentLengthSquared = dx * dx + dy * dy;
  if (segmentLengthSquared === 0) {
    return point.x === start.x && point.y === start.y;
  }
  const toStartVector = { x: point.x - start.x, y: point.y - start.y };
  const projection =
    (toStartVector.x * dx + toStartVector.y * dy) / segmentLengthSquared;
  if (projection < 0 || projection > 1) {
    return false;
  }
  const perpendicularDistanceSquared =
    (toStartVector.x * dy - toStartVector.y * dx) ** 2 / segmentLengthSquared;
  return perpendicularDistanceSquared <= (lineWidth / 2) ** 2;
}

/**
 * 求出一个最小的包含全部包围盒的包围盒
 * @param rectangles
 * @returns
 */
export function getGroupBoundingBox(rectangles: Point[][]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const rectangle of rectangles) {
    for (const point of rectangle) {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
  }
  return { minX, minY, maxX, maxY };
}

/**
 * 获取两个向量的夹角，带方向
 * @param v1
 * @param v2
 * @param needRadians
 * @returns
 */
export function getTwoVectorsAngle(
  v1: Vector2,
  v2: Vector2,
  needRadians: boolean = false
): number {
  const x1 = v1.end.x - v1.start.x;
  const y1 = v1.end.y - v1.start.y;
  const x2 = v2.end.x - v2.start.x;
  const y2 = v2.end.y - v2.start.y;
  const temp1 = Math.sqrt(x1 * x1 + y1 * y1);
  const temp2 = Math.sqrt(x2 * x2 + y2 * y2);
  let angle = Math.acos((x1 * x2 + y1 * y2) / (temp1 * temp2));
  if (x1 * y2 - y1 * x2 > 0) angle = -angle;
  if (needRadians) return angle;
  return angle * CAL_TEMP_2;
}

/**
 * 获取线段的中点
 * @param p1
 * @param p2
 * @returns
 */
export function getMidPoint(p1: Point, p2: Point): Point {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}

/**
 * 获取点到直线的距离
 * @param point
 * @param lineStart
 * @param lineEnd
 * @returns
 */
export function getDistanceToLine(
  point: Point,
  lineStart: Point,
  lineEnd: Point
): number {
  const { x: x1, y: y1 } = lineStart;
  const { x: x2, y: y2 } = lineEnd;
  const { x: x0, y: y0 } = point;
  const A = y2 - y1;
  const B = x1 - x2;
  const C = x2 * y1 - x1 * y2;
  if (A === 0 && B === 0) return getDistanceBetweenPoints(point, lineStart);
  return Math.abs(A * x0 + B * y0 + C) / Math.sqrt(A * A + B * B);
}

/**
 * 获取点在直线的哪一侧 1表示左边或者上边 -1表示右边或者下边 0表示在直线上
 * @param point
 * @param lineStart
 * @param lineEnd
 * @returns
 */
export function getPointLineSide(
  point: Point,
  lineStart: Point,
  lineEnd: Point
): number {
  const { x: x1, y: y1 } = lineStart;
  const { x: x2, y: y2 } = lineEnd;
  const { x: x0, y: y0 } = point;
  const A = y2 - y1;
  const B = x1 - x2;
  const C = x2 * y1 - x1 * y2;
  if (A === 0 && B === 0) throw "It's not a straight line.";
  let pos = 1;
  if (A === 0 && y0 > y2) pos = -1;
  if (A === 0) {
    if (y0 > y2) pos = -1;
    else if (y0 === y2) pos = 0;
  } else if (B === 0) {
    if (x0 > x2) pos = -1;
    if (x0 === x2) pos = 0;
  } else {
    const yn = (-C - A * x0) / B;
    if (y0 > yn) pos = -1;
    else if (y0 === yn) pos = 0;
  }
  return pos;
}

/**
 * 旋转一组点
 * @param vertices
 * @param centerPoint
 * @param angle
 * @param isAngleRadians
 * @returns
 */
export function rotateVertices(
  vertices: Point[],
  centerPoint: Point,
  angle: number,
  isAngleRadians: boolean = false
) {
  if (!isAngleRadians) angle = degreesToRadians(angle);
  if (angle === 0) return vertices;
  const ans = [];
  for (const point of vertices) {
    ans.push(rotatePoint(point, centerPoint, angle, true));
  }
  return ans;
}

/**
 * 生成min到max之间的随机数（包括min和max）
 * @param min
 * @param max
 * @returns
 */
export function generateRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 获取一个点在一条直线上的投影点
 * @param point
 * @param lineA
 * @param lineB
 * @returns
 */
export function getProjectionPointOnLine(
  point: Point,
  lineA: Point,
  lineB: Point
): Point {
  const c1 = lineB.x - lineA.x;
  if (c1 === 0) return { x: lineA.x, y: point.y };
  const m = (lineB.y - lineA.y) / c1;
  const b = lineA.y - m * lineA.x;
  const xP = (m * point.y + point.x - m * b) / (m * m + 1);
  return { x: xP, y: m * xP + b };
}
