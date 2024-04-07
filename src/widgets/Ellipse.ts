import { Point, isPointInEllipse } from "../common/MathUtils";
import { setAttrIfExist } from "../common/Utils";
import { BaseWidget } from "../core/BaseWidget";

export class Ellipse extends BaseWidget {
  private axisX: number = 0;
  private axisY: number = 0;

  constructor(fields: Record<string, any>) {
    super(fields);
    this.widgetType = "ellipse";
    this.updateAxis();
  }

  private updateAxis() {
    setAttrIfExist(this, "axisX", this.width / 2, 0);
    setAttrIfExist(this, "axisY", this.height / 2, 0);
  }

  public isPointInObject(point: Point): boolean {
    return isPointInEllipse(
      point,
      this.axisX,
      this.axisY,
      this.centerPoint,
      this.rotate
    );
  }
}
