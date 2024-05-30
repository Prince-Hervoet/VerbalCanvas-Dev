import { Point, isPointOnLine } from "../common/MathUtils";
import { setAttrIfExist } from "../common/Utils";
import { BaseWidget } from "../core/BaseWidget";

export class Line extends BaseWidget {
  private x1: number = 0;
  private y1: number = 0;
  private x2: number = 0;
  private y2: number = 0;
  private point1: Point = { x: 0, y: 0 };
  private point2: Point = { x: 0, y: 0 };

  constructor(fields: Record<string, any>) {
    super(fields);
    setAttrIfExist(this, "x1", fields.x1, 0);
    setAttrIfExist(this, "y1", fields.y1, 0);
    setAttrIfExist(this, "x2", fields.x2, 0);
    setAttrIfExist(this, "y2", fields.y2, 0);
    this.updateLineFields();
    this.updatePointFields();
    this.widgetType = "line";
  }

  private updateLineFields() {
    this.x = this.x1;
    this.y = this.y1;
    this.width = this.x2 - this.x1;
    this.height = this.y2 - this.y1;
  }

  private updatePointFields() {
    this.point1.x = this.x1;
    this.point1.y = this.y1;
    this.point2.x = this.x2;
    this.point2.y = this.y2;
  }

  protected _update(
    newValue: Record<string, any>,
    oldValue: Record<string, any>
  ): void {
    this.updateLineFields();
    this.updatePointFields();
  }

  protected _isPointInObject(point: Point): boolean {
    return isPointOnLine(
      point,
      this.point1,
      this.point2,
      this.style.lineWidth ?? 2
    );
  }
}
