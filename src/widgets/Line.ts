import { Point, isPointOnLine } from "../common/MathUtils";
import { BaseWidget } from "../core/BaseWidget";

export class Line extends BaseWidget {
  constructor(fields: Record<string, any>) {
    super(fields);
    this.updateLineFields();
    this.widgetType = "line";
  }

  private updateLineFields() {
    if (!this.vertices || this.vertices.length < 2 || this.vertices.length > 2)
      return;
    this.x = this.vertices[0].x;
    this.y = this.vertices[0].y;
    this.width = this.vertices[1].x - this.x;
    this.height = this.vertices[1].y - this.y;
  }

  protected _update(
    newValue: Record<string, any>,
    oldValue: Record<string, any>
  ): void {
    this.updateLineFields();
  }

  public isPointInObject(point: Point): boolean {
    return isPointOnLine(
      point,
      this.vertices[0],
      this.vertices[1],
      this.style.lineWidth ?? 2
    );
  }
}
