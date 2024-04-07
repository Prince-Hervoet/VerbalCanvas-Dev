import { BaseWidget } from "./BaseWidget";
import { VerbalObject } from "./VerbalObject";

/**
 * 绘制器接口
 */
export interface IPainter {
  getContext(): CanvasRenderingContext2D;
  draw(widget: VerbalObject): boolean;
}

/**
 * 基础绘制器实现类
 */
export class BasePainter implements IPainter {
  private context: CanvasRenderingContext2D;
  private static sustainingTypes = ["rect", "ellipse", "polygon", "line"]; // 目前支持绘制的图形

  constructor(ctx: CanvasRenderingContext2D) {
    this.context = ctx;
  }

  public getContext(): CanvasRenderingContext2D {
    return this.context;
  }

  public draw(widget: VerbalObject): boolean {
    if (widget.getObjectType() !== "widget") return false;
    const widgetType: string = widget.getAttr("widgetType");
    if (!BasePainter.sustainingTypes.includes(widgetType)) return false;
    const style = widget.getAttr("style");
    this.context.save();
    VerbalObject.setContextTransform(this.context, widget);
    VerbalObject.setContextStyle(this.context, widget);
    this.setContextPath(widget, widgetType);
    if (style.fillStyle) this.context.fill();
    if (style.strokeStyle) this.context.stroke();
    this.context.restore();
    return true;
  }

  /**
   * 设置绘制路径
   * @param widget
   * @param width
   * @param height
   * @returns
   */
  private setContextPath(
    widget: VerbalObject,
    widgetType: string,
    width?: number,
    height?: number
  ) {
    const finalWidth = width ?? widget.getWidth();
    const finalHeight = height ?? widget.getHeight();
    switch (widgetType) {
      case "rect":
        const cornerRadius = widget.getAttr("cornerRadius");
        this.context.beginPath();
        this.context.roundRect(0, 0, finalWidth, finalHeight, cornerRadius);
        this.context.closePath();
        break;
      case "ellipse":
        const ellipseRadiusX = widget.getAttr("axisX");
        const ellipseRadiusY = widget.getAttr("axisY");
        this.context.beginPath();
        this.context.ellipse(
          ellipseRadiusX,
          ellipseRadiusY,
          ellipseRadiusX,
          ellipseRadiusY,
          0,
          0,
          Math.PI * 2
        );
        break;
      case "polygon":
        const vertices = widget.getAttr("vertices");
        this.context.beginPath();
        this.context.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1; i < vertices.length; ++i)
          this.context.lineTo(vertices[i].x, vertices[i].y);
        this.context.closePath();
        break;
      case "line":
        this.context.beginPath();
        this.context.moveTo(0, 0);
        this.context.lineTo(finalWidth, finalHeight);
        break;
      default:
        return false;
    }
    return true;
  }
}
