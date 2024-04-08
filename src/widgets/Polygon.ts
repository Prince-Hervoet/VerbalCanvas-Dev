import {
  Point,
  getVerticesMinBoundingBox,
  isPointInPolygon,
} from "../common/MathUtils";
import { hasProperty } from "../common/Utils";
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
    if (hasProperty(newValue, "vertices")) {
      this.updatePolygonFields();
      return;
    }
    if (hasProperty(newValue, "width")) {
      const vscaleX = newValue.width / oldValue.width;
      for (const point of this.vertices) {
        point.x *= vscaleX;
      }
    }
    if (hasProperty(newValue, "height")) {
      const vscaleY = newValue.height / oldValue.height;
      for (const point of this.vertices) {
        point.y *= vscaleY;
      }
    }
  }

  public isPointInObject(point: Point): boolean {
    return isPointInPolygon(point, this.boundingBoxVertices);
  }
}
