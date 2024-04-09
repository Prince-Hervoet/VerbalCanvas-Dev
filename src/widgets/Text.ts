import { Point, isPointInPolygon } from "../common/MathUtils";
import { createCanvasDom, hasProperty, setAttrIfExist } from "../common/Utils";
import { BaseWidget } from "../core/BaseWidget";
import { IPainter } from "../core/Painter";
import { VerbalObject } from "../core/VerbalObject";

export class Text extends BaseWidget {
  private text: string = "";
  private maxWidth: number = 0;

  constructor(fields: Record<string, any>) {
    super(fields);
    setAttrIfExist(this, "text", fields.text, "");
    setAttrIfExist(this, "maxWidth", fields.maxWidth, "");
    this.updateTextFields();
    this.widgetType = "text";
  }

  private updateTextFields() {
    const tempCanvas = createCanvasDom();
    const ctx = tempCanvas.getContext("2d")!;
    VerbalObject.setContextStyle(ctx, this);
    ctx.textBaseline = "top";
    const textMetrics = ctx.measureText(this.text);
    this.width =
      textMetrics.actualBoundingBoxRight + textMetrics.actualBoundingBoxLeft;
    this.height = textMetrics.actualBoundingBoxDescent;
    this._updateCenterPoint();
    this._updateBoundingBoxVertices();
  }

  protected _update(
    newValue: Record<string, any>,
    oldValue: Record<string, any>
  ): void {
    if (hasProperty(newValue, "text")) this.updateTextFields();
  }

  protected _render(painter: IPainter): void {
    const ctx = painter.getContext();
    ctx.textBaseline = "top";
    ctx.fillText(this.text, 0, 0);
  }

  public isPointInObject(point: Point): boolean {
    return isPointInPolygon(point, this.boundingBoxVertices);
  }
}
