import { Point, isPointInPolygon } from "../common/MathUtils";
import { setAttrIfExist } from "../common/Utils";
import { BaseWidget, V_WIDGET_TYPE } from "../core/BaseWidget";

export class Rect extends BaseWidget {
  private cornerRadius: number = 0;

  constructor(fields: Record<string, any> = {}) {
    super(fields);
    setAttrIfExist(this, "cornerRadius", fields.cornerRadius, 0);
    this.widgetType = V_WIDGET_TYPE.RECT;
  }

  public isPointInObject(point: Point): boolean {
    return isPointInPolygon(point, this.boundingBoxVertices);
  }
}
