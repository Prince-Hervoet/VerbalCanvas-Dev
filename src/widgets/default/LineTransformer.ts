import { CAL_TEMP_3, Point, isPointInCircle } from "../../common/MathUtils";
import { isPlainObject } from "../../common/Utils";
import { BaseWidget } from "../../core/BaseWidget";
import { Painter } from "../../core/Painter";
import { VerbalObject } from "../../core/VerbalObject";

export class LineTransformer extends BaseWidget {
  private linkTarget: VerbalObject | null = null;
  private circleRadius: number = 8;

  constructor(fields: Record<string, any> = {}) {
    super(fields);
    this.setDefaultStyle();
    this.widgetType = "lineTransformer";
  }

  private setDefaultStyle() {
    if (!isPlainObject(this.style)) return;
    this.style = {
      fillStyle: "#d2dae2",
      strokeStyle: "#3c40c6",
    };
  }

  private updateLineTransformerFields() {
    if (!this.linkTarget) return;
    this.x = this.linkTarget.getX();
    this.y = this.linkTarget.getY();
    this.width = this.linkTarget.getWidth();
    this.height = this.linkTarget.getHeight();
  }

  linkTo(target: VerbalObject | null) {
    if (
      !target ||
      target.getObjectType() !== "widget" ||
      target.getAttr("widgetType") !== "line"
    ) {
      this.linkTarget = null;
      return;
    }
    this.linkTarget = target;
    this.updateLineTransformerFields();
  }

  protected _render(painter: Painter): void {
    const ctx = painter.getContext();
    ctx.beginPath();
    ctx.arc(0, 0, this.circleRadius, 0, CAL_TEMP_3);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.arc(this.width, this.height, this.circleRadius, 0, CAL_TEMP_3);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }

  pointOnControlPointIndex(point: Point): number {
    if (isPointInCircle(point, { x: this.x, y: this.y }, this.circleRadius))
      return 0;
    if (
      isPointInCircle(
        point,
        { x: this.x + this.width, y: this.y + this.height },
        this.circleRadius
      )
    )
      return 1;
    return -1;
  }

  _isPointInObject(point: Point): boolean {
    return this.pointOnControlPointIndex(point) !== -1;
  }

  transformTarget(mousePoint: Point, index: number) {
    if (!this.linkTarget || (index !== 0 && index !== 1)) return;
    const nvertices = [];
    if (index === 0) {
      nvertices[0] = mousePoint;
      nvertices[1] = this.vertices[1];
    } else if (index === 1) {
      nvertices[0] = this.vertices[0];
      nvertices[1] = mousePoint;
    }
    this.linkTarget.update("vertices", nvertices);
    this.updateLineTransformerFields();
  }
}
