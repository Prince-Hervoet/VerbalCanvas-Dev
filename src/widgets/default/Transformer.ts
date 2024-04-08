import {
  CAL_TEMP_3,
  Point,
  Vector2,
  ZeroOneVector2,
  degreesToRadians,
  getDistanceToLine,
  getMidPoint,
  getPointLineSide,
  getTwoVectorsAngle,
  isPointInCircle,
  rotatePoint,
  rotateVertices,
} from "../../common/MathUtils";
import { isPlainObject } from "../../common/Utils";
import { BaseWidget } from "../../core/BaseWidget";
import { IPainter } from "../../core/Painter";
import { VerbalObject } from "../../core/VerbalObject";

enum ControlPointNames {
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
    this.width = this.linkTarget.getWidth();
    this.height = this.linkTarget.getHeight();
    this.rotate = this.linkTarget.getRotate();
    this._updateCenterPoint();
    this._updateBoundingBoxVertices();
    this.updateTransformGlobalVertices();
    this.updateTransformerVertices();
    console.log(this.centerPoint);
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

  protected _render(painter: IPainter): void {
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

  transformTarget(mousePoint: Point, index: number): number {
    if (!this.linkTarget) return -1;
    const boundingBox = this.getBoundingBoxVertices();
    const rotateRad = degreesToRadians(this.getRotate());
    const neRotateRad = -rotateRad;
    let nWidth = 0,
      nHeight = 0;
    let temp1: Point, temp2: Point;
    let shouldIndex = index;
    let updateResult: any = {};
    const mathCos = Math.cos(rotateRad);
    const mathSin = Math.sin(rotateRad);
    let pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;
    switch (index) {
      case ControlPointNames.TOP_LEFT: // 左上角
        pos1 = getPointLineSide(mousePoint, boundingBox[1], boundingBox[2]);
        pos2 = getPointLineSide(mousePoint, boundingBox[2], boundingBox[3]);
        pos3 = getPointLineSide(boundingBox[0], boundingBox[1], boundingBox[2]);
        pos4 = getPointLineSide(boundingBox[0], boundingBox[2], boundingBox[3]);
        if (pos1 !== pos3 && pos2 !== pos4) {
          mousePoint = rotatePoint(
            boundingBox[2],
            this.centerPoint,
            neRotateRad,
            true
          );
          mousePoint.y -= 1;
          mousePoint.x -= 1;
          mousePoint = rotatePoint(
            mousePoint,
            this.centerPoint,
            rotateRad,
            true
          );
          shouldIndex = 2;
        } else if (pos1 !== pos3) {
          mousePoint = rotatePoint(
            boundingBox[1],
            this.centerPoint,
            neRotateRad,
            true
          );
          mousePoint.x -= 1;
          mousePoint = rotatePoint(
            mousePoint,
            this.centerPoint,
            rotateRad,
            true
          );
          shouldIndex = 1;
        } else if (pos2 !== pos4) {
          mousePoint = rotatePoint(
            boundingBox[3],
            this.centerPoint,
            neRotateRad,
            true
          );
          mousePoint.y -= 1;
          mousePoint = rotatePoint(
            mousePoint,
            this.centerPoint,
            rotateRad,
            true
          );
          shouldIndex = 3;
        }
        nWidth = getDistanceToLine(mousePoint, boundingBox[1], boundingBox[2]);
        nHeight = getDistanceToLine(mousePoint, boundingBox[2], boundingBox[3]);
        temp1 = getMidPoint(mousePoint, boundingBox[2]);
        temp2 = rotatePoint(mousePoint, temp1, neRotateRad, true);
        updateResult = {
          x: temp2.x,
          y: temp2.y,
          width: nWidth,
          height: nHeight,
        };
        break;
      case ControlPointNames.TOP_RIGHT: // 右上角
        // debugger;
        pos1 = getPointLineSide(mousePoint, boundingBox[0], boundingBox[3]);
        pos2 = getPointLineSide(mousePoint, boundingBox[2], boundingBox[3]);
        pos3 = getPointLineSide(boundingBox[1], boundingBox[0], boundingBox[3]);
        pos4 = getPointLineSide(boundingBox[1], boundingBox[2], boundingBox[3]);
        if (pos1 !== pos3 && pos2 !== pos4) {
          mousePoint = rotatePoint(
            boundingBox[3],
            this.centerPoint,
            neRotateRad,
            true
          );
          mousePoint.y -= 1;
          mousePoint.x += 1;
          mousePoint = rotatePoint(
            mousePoint,
            this.centerPoint,
            rotateRad,
            true
          );
          shouldIndex = 3;
        } else if (pos1 !== pos3) {
          mousePoint = rotatePoint(
            boundingBox[0],
            this.centerPoint,
            neRotateRad,
            true
          );
          mousePoint.x += 1;
          mousePoint = rotatePoint(
            mousePoint,
            this.centerPoint,
            rotateRad,
            true
          );
          shouldIndex = 0;
        } else if (pos2 !== pos4) {
          mousePoint = rotatePoint(
            boundingBox[2],
            this.centerPoint,
            neRotateRad,
            true
          );
          mousePoint.y -= 1;
          mousePoint = rotatePoint(
            mousePoint,
            this.centerPoint,
            rotateRad,
            true
          );
          shouldIndex = 2;
        }
        nWidth = getDistanceToLine(mousePoint, boundingBox[0], boundingBox[3]);
        nHeight = getDistanceToLine(mousePoint, boundingBox[2], boundingBox[3]);
        temp1 = getMidPoint(mousePoint, boundingBox[3]);
        temp2 = rotatePoint(mousePoint, temp1, neRotateRad, true);
        updateResult = {
          x: temp2.x - nWidth,
          y: temp2.y,
          width: nWidth,
          height: nHeight,
        };
        break;
      case ControlPointNames.BOTTOM_RIGHT: // 右下角
        pos1 = getPointLineSide(mousePoint, boundingBox[0], boundingBox[3]);
        pos2 = getPointLineSide(mousePoint, boundingBox[0], boundingBox[1]);
        pos3 = getPointLineSide(boundingBox[2], boundingBox[0], boundingBox[3]);
        pos4 = getPointLineSide(boundingBox[2], boundingBox[0], boundingBox[1]);
        if (pos1 !== pos3 && pos2 !== pos4) {
          mousePoint = rotatePoint(
            boundingBox[0],
            this.centerPoint,
            neRotateRad,
            true
          );
          mousePoint.y += 1;
          mousePoint.x += 1;
          mousePoint = rotatePoint(
            mousePoint,
            this.centerPoint,
            rotateRad,
            true
          );
          shouldIndex = 0;
        } else if (pos1 !== pos3) {
          mousePoint = rotatePoint(
            boundingBox[3],
            this.centerPoint,
            neRotateRad,
            true
          );
          mousePoint.x += 1;
          mousePoint = rotatePoint(
            mousePoint,
            this.centerPoint,
            rotateRad,
            true
          );
          shouldIndex = 3;
        } else if (pos2 !== pos4) {
          mousePoint = rotatePoint(
            boundingBox[1],
            this.centerPoint,
            neRotateRad,
            true
          );
          mousePoint.y += 1;
          mousePoint = rotatePoint(
            mousePoint,
            this.centerPoint,
            rotateRad,
            true
          );
          shouldIndex = 1;
        }
        nWidth = getDistanceToLine(mousePoint, boundingBox[0], boundingBox[3]);
        nHeight = getDistanceToLine(mousePoint, boundingBox[0], boundingBox[1]);
        updateResult = { width: nWidth, height: nHeight };
        break;
      case ControlPointNames.BOTTOM_LEFT: // 左下角
        // debugger;
        pos1 = getPointLineSide(mousePoint, boundingBox[1], boundingBox[2]);
        pos2 = getPointLineSide(mousePoint, boundingBox[0], boundingBox[1]);
        pos3 = getPointLineSide(boundingBox[3], boundingBox[1], boundingBox[2]);
        pos4 = getPointLineSide(boundingBox[3], boundingBox[0], boundingBox[1]);
        if (pos1 !== pos3 && pos2 !== pos4) {
          mousePoint = rotatePoint(
            boundingBox[1],
            this.centerPoint,
            neRotateRad,
            true
          );
          mousePoint.y += 1;
          mousePoint.x -= 1;
          mousePoint = rotatePoint(
            mousePoint,
            this.centerPoint,
            rotateRad,
            true
          );
          shouldIndex = 1;
        } else if (pos1 !== pos3) {
          mousePoint = rotatePoint(
            boundingBox[2],
            this.centerPoint,
            neRotateRad,
            true
          );
          mousePoint.x -= 1;
          mousePoint = rotatePoint(
            mousePoint,
            this.centerPoint,
            rotateRad,
            true
          );
          shouldIndex = 2;
        } else if (pos2 !== pos4) {
          mousePoint = rotatePoint(
            boundingBox[0],
            this.centerPoint,
            neRotateRad,
            true
          );
          mousePoint.y += 1;
          mousePoint = rotatePoint(
            mousePoint,
            this.centerPoint,
            rotateRad,
            true
          );
          shouldIndex = 0;
        }
        nWidth = getDistanceToLine(mousePoint, boundingBox[1], boundingBox[2]);
        nHeight = getDistanceToLine(mousePoint, boundingBox[0], boundingBox[1]);
        temp1 = getMidPoint(mousePoint, boundingBox[1]);
        temp2 = rotatePoint(mousePoint, temp1, neRotateRad, true);
        updateResult = {
          x: temp2.x,
          y: temp2.y - nHeight,
          width: nWidth,
          height: nHeight,
        };
        break;
      case ControlPointNames.ROTATE_POINT: // 旋转点
        const centerPoint = this.getCenterPoint();
        const currentVector: Vector2 = { start: centerPoint, end: mousePoint };
        const angle = getTwoVectorsAngle(currentVector, ZeroOneVector2);
        updateResult = { rotate: angle };
        break;
      case ControlPointNames.TOP_CENTER:
        pos1 = getPointLineSide(mousePoint, boundingBox[2], boundingBox[3]);
        pos2 = getPointLineSide(boundingBox[1], boundingBox[2], boundingBox[3]);
        if (pos1 !== pos2) {
          nHeight = 1;
          shouldIndex = 7;
        } else {
          nHeight = getDistanceToLine(
            mousePoint,
            boundingBox[2],
            boundingBox[3]
          );
        }
        const halfnHeight = nHeight / 2;
        temp1 = getMidPoint(boundingBox[2], boundingBox[3]);
        temp2 = {
          x: temp1.x + mathSin * halfnHeight,
          y: temp1.y - mathCos * halfnHeight,
        };
        temp1 = rotatePoint(temp1, temp2, neRotateRad, true);
        updateResult = {
          x: temp1.x - this.width / 2,
          y: temp1.y - nHeight,
          height: nHeight,
        };
        break;
      case ControlPointNames.RIGHT_CENTER:
        // debugger;
        pos1 = getPointLineSide(mousePoint, boundingBox[0], boundingBox[3]);
        pos2 = getPointLineSide(boundingBox[1], boundingBox[0], boundingBox[3]);
        if (pos1 !== pos2) {
          nWidth = 1;
          shouldIndex = 8;
        } else {
          nWidth = getDistanceToLine(
            mousePoint,
            boundingBox[0],
            boundingBox[3]
          );
        }
        updateResult = { width: nWidth };
        if (nWidth === 1) {
          shouldIndex = 8;
        }
        break;
      case ControlPointNames.BOTTOM_CENTER:
        pos1 = getPointLineSide(mousePoint, boundingBox[0], boundingBox[1]);
        pos2 = getPointLineSide(boundingBox[2], boundingBox[0], boundingBox[1]);
        if (pos1 !== pos2) {
          nHeight = 1;
          shouldIndex = 5;
        } else {
          nHeight = getDistanceToLine(
            mousePoint,
            boundingBox[0],
            boundingBox[1]
          );
        }
        updateResult = { height: nHeight };
        break;
      case ControlPointNames.LEFT_CENTER:
        pos1 = getPointLineSide(mousePoint, boundingBox[1], boundingBox[2]);
        pos2 = getPointLineSide(boundingBox[0], boundingBox[1], boundingBox[2]);
        if (pos1 !== pos2) {
          nWidth = 1;
          shouldIndex = 6;
        } else {
          nWidth = getDistanceToLine(
            mousePoint,
            boundingBox[1],
            boundingBox[2]
          );
        }
        const halfnWidth = nWidth / 2;
        temp1 = getMidPoint(boundingBox[1], boundingBox[2]);
        temp2 = {
          x: temp1.x - mathCos * halfnWidth,
          y: temp1.y - mathSin * halfnWidth,
        };
        temp1 = rotatePoint(temp1, temp2, -rotateRad, true);
        updateResult = {
          x: temp1.x - nWidth,
          y: temp2.y - this.height / 2,
          width: nWidth,
        };
        break;
    }
    this.linkTarget.setFields(updateResult, false);
    this.setFields(updateResult, true);
    return shouldIndex;
  }
}
