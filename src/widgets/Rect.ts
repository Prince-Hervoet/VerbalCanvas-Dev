import { Point, isPointInPolygon } from "../common/MathUtils";
import { setAttrIfExist } from "../common/Utils";
import { BaseWidget } from "../core/BaseWidget";

export class Rect extends BaseWidget {
  private cornerRadius: number = 0;

  constructor(fields: Record<string, any> = {}) {
    super(fields);
    this.widgetType = "rect";
    setAttrIfExist(this, "cornerRadius", fields.cornerRadius, 0);
  }

  public isPointInObject(point: Point): boolean {
    return isPointInPolygon(point, this.boundingBoxVertices);
  }
}
