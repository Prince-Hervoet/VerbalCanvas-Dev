import {
  Point,
  getVerticesMinBoundingBox,
  isPointInPolygon,
} from "../common/MathUtils";
import { BaseWidget } from "../core/BaseWidget";

export class Polygon extends BaseWidget {
  constructor(fields: Record<string, any>) {
    super(fields);
    this.updatePolygonFields();
    this.widgetType = "polygon";
  }

  private updatePolygonFields() {
    const { minX, minY, maxX, maxY } = getVerticesMinBoundingBox(this.vertices);
    this.x = minX;
    this.y = minY;
    this.width = maxX - minX;
    this.height = maxY - minY;
    for (const point of this.vertices) {
      point.x -= this.x;
      point.y -= this.y;
    }
    this._updateCenterPoint();
    this._updateBoundingBoxVertices();
  }

  protected _update(
    newValue: Record<string, any>,
    oldValue: Record<string, any>
  ): void {
    if (newValue.hasOwn("vertices")) {
      this.updatePolygonFields();
      return;
    }
    if (newValue.hasOwn("width")) {
      const vscaleX = oldValue.width / newValue.width;
      for (const point of this.vertices) {
        point.x *= vscaleX;
      }
    }
    if (newValue.hasOwn("height")) {
      const vscaleY = oldValue.height / newValue.height;
      for (const point of this.vertices) {
        point.y *= vscaleY;
      }
    }
  }

  public isPointInObject(point: Point): boolean {
    return isPointInPolygon(point, this.boundingBoxVertices);
  }
}
