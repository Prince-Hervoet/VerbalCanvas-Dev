import {
  CAL_TEMP_3,
  Point,
  Vector2,
  ZeroOneVector2,
  degreesToRadians,
  getDistanceBetweenPoints,
  getDistanceToLine,
  getMidPoint,
  getPointLineSide,
  getProjectionPointOnLine,
  getTwoVectorsAngle,
  isPointInCircle,
  rotatePoint,
  rotateVertices,
} from "../../common/MathUtils";
import { hasProperty, isPlainObject } from "../../common/Utils";
import { BaseWidget } from "../../core/BaseWidget";
import { Painter } from "../../core/Painter";
import { VerbalObject } from "../../core/VerbalObject";

enum ControlPointNames {
  TOP_LEFT, // 左上角
  TOP_RIGHT, // 右上角
  BOTTOM_RIGHT, // 右下角
  BOTTOM_LEFT, // 左下角
  ROTATE_POINT, // 旋转点
  TOP_CENTER, // 中上
  RIGHT_CENTER, // 右中
  BOTTOM_CENTER, // 下中
  LEFT_CENTER, // 左中
}

export class Transformer extends BaseWidget {
  private linkTarget: VerbalObject | null = null;
  private circleRadius: number = 8;
  private globalVertices: Point[] = [];

  constructor(fields: Record<string, any> = {}) {
    super(fields);
    this.setDefaultStyle();
    this.widgetType = "transformer";
  }

  private setDefaultStyle() {
    if (!isPlainObject(this.style)) return;
    this.style = {
      fillStyle: "#d2dae2",
      strokeStyle: "#3c40c6",
    };
  }

  private udpateTransformerFields() {
    if (!this.linkTarget) return;
    this.x = this.linkTarget.getX();
    this.y = this.linkTarget.getY();
    this.width = this.linkTarget.getFinalWidth();
    this.height = this.linkTarget.getFinalHeight();
    this.rotate = this.linkTarget.getRotate();
    this._updateCenterPoint();
    this._updateBoundingBoxVertices();
    this.updateTransformGlobalVertices();
    this.updateTransformerVertices();
  }

  private updateTransformerVertices() {
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;
    this.vertices = [
      { x: 0, y: 0 },
      { x: this.width, y: 0 },
      { x: this.width, y: this.height },
      { x: 0, y: this.height },
      { x: halfWidth, y: -28 },
      { x: halfWidth, y: 0 },
      { x: this.width, y: halfHeight },
      { x: halfWidth, y: this.height },
      { x: 0, y: halfHeight },
    ];
  }

  private updateTransformGlobalVertices() {
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;
    const temp1 = this.x + this.width;
    const temp2 = this.x + halfWidth;
    const temp3 = this.y + this.height;
    const temp4 = this.y + halfHeight;
    this.globalVertices = [
      { x: this.x, y: this.y },
      { x: temp1, y: this.y },
      { x: temp1, y: temp3 },
      { x: this.x, y: temp3 },
      { x: temp2, y: this.y - 28 },
      { x: temp2, y: this.y },
      { x: temp1, y: temp4 },
      { x: temp2, y: temp3 },
      { x: this.x, y: temp4 },
    ];
    if (this.rotate === 0) return;
    this.globalVertices = rotateVertices(
      this.globalVertices,
      this.centerPoint,
      this.rotate,
      false
    );
  }

  protected _update(
    newValue: Record<string, any>,
    oldValue: Record<string, any>
  ): void {
    this.updateTransformGlobalVertices();
    this.updateTransformerVertices();
  }

  linkTo(obj: VerbalObject | null) {
    this.linkTarget = obj;
    this.udpateTransformerFields();
  }

  pointOnControlPointIndex(point: Point): number {
    for (let i = 0; i < this.globalVertices.length; ++i) {
      if (isPointInCircle(point, this.globalVertices[i], this.circleRadius))
        return i;
    }
    return -1;
  }

  protected _render(painter: Painter): void {
    const ctx = painter.getContext();
    ctx.strokeRect(0, 0, this.width, this.height);
    for (let i = 0; i < this.vertices.length; ++i) {
      ctx.beginPath();
      ctx.arc(
        this.vertices[i].x,
        this.vertices[i].y,
        this.circleRadius,
        0,
        CAL_TEMP_3
      );
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
    }
  }

  isPointInObject(point: Point): boolean {
    return this.pointOnControlPointIndex(point) !== -1;
  }

  transformTarget(
    mousePoint: Point,
    index: number,
    isProportional: boolean = false
  ): number {
    if (!this.linkTarget) return -1;
    const boundingBox = this.getBoundingBoxVertices();
    const b0 = boundingBox[0];
    const b1 = boundingBox[1];
    const b2 = boundingBox[2];
    const b3 = boundingBox[3];
    const rotateRad = degreesToRadians(this.getRotate());
    const neRotateRad = -rotateRad;
    let nw = 0,
      nh = 0,
      nx = 0,
      ny = 0;
    let temp1: Point, temp2: Point;
    let shouldIndex = index;
    let updateResult: any = {};
    const mathCos = Math.cos(rotateRad);
    const mathSin = Math.sin(rotateRad);
    let pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;
    const nCenterPoint = this.centerPoint;
    switch (index) {
      case ControlPointNames.TOP_LEFT: // 左上角
        pos1 = getPointLineSide(mousePoint, b1, b2);
        pos2 = getPointLineSide(mousePoint, b2, b3);
        pos3 = getPointLineSide(b0, b1, b2);
        pos4 = getPointLineSide(b0, b2, b3);
        if (pos1 !== pos3 && pos2 !== pos4) {
          mousePoint = rotatePoint(b2, nCenterPoint, neRotateRad, true);
          mousePoint.y -= 1;
          mousePoint.x -= 1;
          mousePoint = rotatePoint(mousePoint, nCenterPoint, rotateRad, true);
          shouldIndex = 2;
        } else if (pos1 !== pos3) {
          mousePoint = rotatePoint(b1, nCenterPoint, neRotateRad, true);
          mousePoint.x -= 1;
          mousePoint = rotatePoint(mousePoint, nCenterPoint, rotateRad, true);
          shouldIndex = 1;
        } else if (pos2 !== pos4) {
          mousePoint = rotatePoint(b3, nCenterPoint, neRotateRad, true);
          mousePoint.y -= 1;
          mousePoint = rotatePoint(mousePoint, nCenterPoint, rotateRad, true);
          shouldIndex = 3;
        }
        if (isProportional)
          mousePoint = getProjectionPointOnLine(mousePoint, b0, b2);
        nw = getDistanceToLine(mousePoint, b1, b2);
        nh = getDistanceToLine(mousePoint, b2, b3);
        temp1 = getMidPoint(mousePoint, b2);
        temp2 = rotatePoint(mousePoint, temp1, neRotateRad, true);
        updateResult = { x: temp2.x, y: temp2.y, width: nw, height: nh };
        break;
      case ControlPointNames.TOP_RIGHT: // 右上角
        // debugger;
        pos1 = getPointLineSide(mousePoint, b0, b3);
        pos2 = getPointLineSide(mousePoint, b2, b3);
        pos3 = getPointLineSide(b1, b0, b3);
        pos4 = getPointLineSide(b1, b2, b3);
        if (pos1 !== pos3 && pos2 !== pos4) {
          mousePoint = rotatePoint(b3, nCenterPoint, neRotateRad, true);
          mousePoint.y -= 1;
          mousePoint.x += 1;
          mousePoint = rotatePoint(mousePoint, nCenterPoint, rotateRad, true);
          shouldIndex = 3;
        } else if (pos1 !== pos3) {
          mousePoint = rotatePoint(b0, nCenterPoint, neRotateRad, true);
          mousePoint.x += 1;
          mousePoint = rotatePoint(mousePoint, nCenterPoint, rotateRad, true);
          shouldIndex = 0;
        } else if (pos2 !== pos4) {
          mousePoint = rotatePoint(b2, nCenterPoint, neRotateRad, true);
          mousePoint.y -= 1;
          mousePoint = rotatePoint(mousePoint, nCenterPoint, rotateRad, true);
          shouldIndex = 2;
        }
        if (isProportional)
          mousePoint = getProjectionPointOnLine(mousePoint, b3, b1);
        nw = getDistanceToLine(mousePoint, b0, b3);
        nh = getDistanceToLine(mousePoint, b2, b3);
        temp1 = getMidPoint(mousePoint, b3);
        temp2 = rotatePoint(mousePoint, temp1, neRotateRad, true);
        updateResult = { x: temp2.x - nw, y: temp2.y, width: nw, height: nh };
        break;
      case ControlPointNames.BOTTOM_RIGHT: // 右下角
        pos1 = getPointLineSide(mousePoint, b0, b3);
        pos2 = getPointLineSide(mousePoint, b0, b1);
        pos3 = getPointLineSide(b2, b0, b3);
        pos4 = getPointLineSide(b2, b0, b1);
        if (pos1 !== pos3 && pos2 !== pos4) {
          mousePoint = rotatePoint(b0, nCenterPoint, neRotateRad, true);
          mousePoint.y += 1;
          mousePoint.x += 1;
          mousePoint = rotatePoint(mousePoint, nCenterPoint, rotateRad, true);
          shouldIndex = 0;
        } else if (pos1 !== pos3) {
          mousePoint = rotatePoint(b3, nCenterPoint, neRotateRad, true);
          mousePoint.x += 1;
          mousePoint = rotatePoint(mousePoint, nCenterPoint, rotateRad, true);
          shouldIndex = 3;
        } else if (pos2 !== pos4) {
          mousePoint = rotatePoint(b1, nCenterPoint, neRotateRad, true);
          mousePoint.y += 1;
          mousePoint = rotatePoint(mousePoint, nCenterPoint, rotateRad, true);
          shouldIndex = 1;
        }
        if (isProportional)
          mousePoint = getProjectionPointOnLine(mousePoint, b0, b2);
        nw = getDistanceToLine(mousePoint, b0, b3);
        nh = getDistanceToLine(mousePoint, b0, b1);
        updateResult = { width: nw, height: nh };
        break;
      case ControlPointNames.BOTTOM_LEFT: // 左下角
        // debugger;
        pos1 = getPointLineSide(mousePoint, b1, b2);
        pos2 = getPointLineSide(mousePoint, b0, b1);
        pos3 = getPointLineSide(b3, b1, b2);
        pos4 = getPointLineSide(b3, b0, b1);
        if (pos1 !== pos3 && pos2 !== pos4) {
          mousePoint = rotatePoint(b1, nCenterPoint, neRotateRad, true);
          mousePoint.y += 1;
          mousePoint.x -= 1;
          mousePoint = rotatePoint(mousePoint, nCenterPoint, rotateRad, true);
          shouldIndex = 1;
        } else if (pos1 !== pos3) {
          mousePoint = rotatePoint(b2, nCenterPoint, neRotateRad, true);
          mousePoint.x -= 1;
          mousePoint = rotatePoint(mousePoint, nCenterPoint, rotateRad, true);
          shouldIndex = 2;
        } else if (pos2 !== pos4) {
          mousePoint = rotatePoint(b0, nCenterPoint, neRotateRad, true);
          mousePoint.y += 1;
          mousePoint = rotatePoint(mousePoint, nCenterPoint, rotateRad, true);
          shouldIndex = 0;
        }
        if (isProportional)
          mousePoint = getProjectionPointOnLine(mousePoint, b3, b1);
        nw = getDistanceToLine(mousePoint, b1, b2);
        nh = getDistanceToLine(mousePoint, b0, b1);
        temp1 = getMidPoint(mousePoint, b1);
        temp2 = rotatePoint(mousePoint, temp1, neRotateRad, true);
        updateResult = { x: temp2.x, y: temp2.y - nh, width: nw, height: nh };
        break;
      case ControlPointNames.ROTATE_POINT: // 旋转点
        const centerPoint = this.getCenterPoint();
        const currentVector: Vector2 = { start: centerPoint, end: mousePoint };
        const angle = getTwoVectorsAngle(currentVector, ZeroOneVector2);
        updateResult = { rotate: angle };
        break;
      case ControlPointNames.TOP_CENTER:
        if (isProportional) break;
        pos1 = getPointLineSide(mousePoint, b2, b3);
        pos2 = getPointLineSide(b1, b2, b3);
        if (pos1 !== pos2) {
          nh = 1;
          shouldIndex = 7;
        } else nh = getDistanceToLine(mousePoint, b2, b3);
        const halfnH = nh / 2;
        temp1 = getMidPoint(b2, b3);
        temp2 = {
          x: temp1.x + mathSin * halfnH,
          y: temp1.y - mathCos * halfnH,
        };
        temp1 = rotatePoint(temp1, temp2, neRotateRad, true);
        nx = temp1.x - this.width / 2;
        ny = temp1.y - nh;
        updateResult = { x: nx, y: ny, height: nh };
        break;
      case ControlPointNames.RIGHT_CENTER:
        if (isProportional) break;
        // debugger;
        pos1 = getPointLineSide(mousePoint, b0, b3);
        pos2 = getPointLineSide(b1, b0, b3);
        if (pos1 !== pos2) {
          nw = 1;
          shouldIndex = 8;
        } else nw = getDistanceToLine(mousePoint, b0, b3);
        updateResult = { width: nw };
        break;
      case ControlPointNames.BOTTOM_CENTER:
        if (isProportional) break;
        pos1 = getPointLineSide(mousePoint, b0, b1);
        pos2 = getPointLineSide(b2, b0, b1);
        if (pos1 !== pos2) {
          nh = 1;
          shouldIndex = 5;
        } else nh = getDistanceToLine(mousePoint, b0, b1);
        updateResult = { height: nh };
        break;
      case ControlPointNames.LEFT_CENTER:
        if (isProportional) break;
        pos1 = getPointLineSide(mousePoint, b1, b2);
        pos2 = getPointLineSide(b0, b1, b2);
        if (pos1 !== pos2) {
          nw = 1;
          shouldIndex = 6;
        } else nw = getDistanceToLine(mousePoint, b1, b2);
        const halfnWidth = nw / 2;
        temp1 = getMidPoint(b1, b2);
        temp2 = {
          x: temp1.x - mathCos * halfnWidth,
          y: temp1.y - mathSin * halfnWidth,
        };
        temp1 = rotatePoint(temp1, temp2, -rotateRad, true);
        nx = temp1.x - nw;
        ny = temp2.y - this.height / 2;
        updateResult = { x: nx, y: ny, width: nw };
        break;
    }
    const targetUpdateResult = this.changeUpdateResultToScale(updateResult);
    this.linkTarget.setFields(targetUpdateResult, false);
    this.setFields(updateResult, true);
    return shouldIndex;
  }

  private changeUpdateResultToScale(updateResult: any) {
    let targetUpdateResult: any = {};
    if (!this.linkTarget) return targetUpdateResult;
    targetUpdateResult = Object.assign({}, updateResult);
    if (hasProperty(updateResult, "width")) {
      targetUpdateResult.scaleX =
        updateResult.width / this.linkTarget.getWidth();
      delete targetUpdateResult.width;
    }
    if (hasProperty(updateResult, "height")) {
      targetUpdateResult.scaleY =
        updateResult.height / this.linkTarget.getHeight();
      delete targetUpdateResult.height;
    }
    return targetUpdateResult;
  }
}
