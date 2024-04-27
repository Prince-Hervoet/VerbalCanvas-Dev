import { Point, degreesToRadians } from "../common/MathUtils";
import { getCtxTransformScale, recoverContextScale } from "../common/Utils";
import { BaseWidget } from "./BaseWidget";
import { VerbalObject } from "./VerbalObject";

/**
 * 绘制器接口
 */
export interface Painter {
  /**
   * 获取canvas上下文
   */
  getContext(): CanvasRenderingContext2D;

  /**
   * 绘制方法
   * @param widget
   */
  draw(widget: VerbalObject): boolean;
}

/**
 * 基础绘制器实现类
 */
export class BasePainter implements Painter {
  private context: CanvasRenderingContext2D;
  private defaultStartPoint: Point = { x: 0, y: 0 };
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
    const isFixedLineWidth = widget.getAttr("isFixedLineWidth");
    this.context.save();
    VerbalObject.setContextTransform(this.context, widget);
    VerbalObject.setContextStyle(this.context, widget);
    this.setContextPath(widget, widgetType);
    if (style.fillStyle) this.context.fill();
    if (style.strokeStyle) {
      if (isFixedLineWidth) this.handleFixedLineWidth(widget);
      this.context.stroke();
    }
    this.context.restore();
    return true;
  }

  /**
   * 处理线宽固定问题
   * @param widget
   */
  private handleFixedLineWidth(widget: VerbalObject) {
    const [finalScaleX, finalScaleY] = getCtxTransformScale(this.context);
    recoverContextScale(this.context);
    this.setContextPath(
      widget,
      widget.getAttr("widgetType"),
      widget.getWidth() * finalScaleX,
      widget.getHeight() * finalScaleY
    );
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
        this.context.roundRect(
          this.defaultStartPoint.x,
          this.defaultStartPoint.y,
          finalWidth,
          finalHeight,
          cornerRadius
        );
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
          this.defaultStartPoint.x,
          this.defaultStartPoint.y,
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
        this.context.moveTo(this.defaultStartPoint.x, this.defaultStartPoint.y);
        this.context.lineTo(finalWidth, finalHeight);
        break;
      default:
        return false;
    }
    return true;
  }
}
