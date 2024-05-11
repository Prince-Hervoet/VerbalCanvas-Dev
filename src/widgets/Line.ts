import { Point, isPointOnLine } from "../common/MathUtils";
import { setAttrIfExist } from "../common/Utils";
import { BaseWidget } from "../core/BaseWidget";
import { Painter } from "../core/Painter";
import { VerbalObject } from "../core/VerbalObject";

export class Line extends BaseWidget {
  private x1: number = 0;
  private y1: number = 0;
  private x2: number = 0;
  private y2: number = 0;

  constructor(fields: Record<string, any>) {
    super(fields);
    setAttrIfExist(this, "x1", fields.x1, 0);
    setAttrIfExist(this, "y1", fields.y1, 0);
    setAttrIfExist(this, "x2", fields.x2, 0);
    setAttrIfExist(this, "y2", fields.y2, 0);
    this.updateLineFields();
    this.widgetType = "line";
  }

  private updateLineFields() {
    this.x = this.x1;
    this.y = this.y1;
    this.width = this.x2 - this.x1;
    this.height = this.y2 - this.y1;
  }

  protected _update(
    newValue: Record<string, any>,
    oldValue: Record<string, any>
  ): void {
    this.updateLineFields();
  }

  protected _render(painter: Painter): void {
    const ctx = painter.getContext();
    VerbalObject.setContextTransform(ctx, this);
    VerbalObject.setContextStyle(ctx, this);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this.width, this.height);
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
