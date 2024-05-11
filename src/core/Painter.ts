import { Point } from "../common/MathUtils";
import { getCtxTransformScale, recoverContextScale } from "../common/Utils";
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
  private ctx: CanvasRenderingContext2D;
  private defaultStartPoint: Point = { x: 0, y: 0 }; // 默认绘制左上角点
  private static sustainingTypes = ["rect", "ellipse", "polygon", "line"]; // 目前支持绘制的图形
  private static specialTypes = ["line"];

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  public draw(widget: VerbalObject): boolean {
    if (widget.getObjectType() !== "widget") return false;
    const widgetType: string = widget.getAttr("widgetType");
    if (!BasePainter.sustainingTypes.includes(widgetType)) return false;
    // ==================以上是判断类型=======================
    if (BasePainter.sustainingTypes.includes(widgetType))
      return this.handleSpecialWidget(widget);
    // ================以上是区分特殊类型======================
    const style = widget.getAttr("style");
    this.ctx.save();
    VerbalObject.setContextTransform(this.ctx, widget); // 设置上下文变换
    VerbalObject.setContextStyle(this.ctx, widget); // 设置上下文风格
    if (style.strokeStyle)
      // 如果需要绘制描边，才需要根据线宽调整起始点
      this.handleStartWithLineWidth(this.ctx.lineWidth ?? 1);
    this.setContextPath(widget, widgetType);
    if (style.fillStyle) this.ctx.fill();
    if (style.strokeStyle) {
      // 如果设置了线宽固定，才需要重新设置缩放系数
      const isFixedLineWidth = widget.getAttr("isFixedLineWidth");
      if (isFixedLineWidth) this.handleFixedLineWidth(widget);
      this.ctx.stroke();
    }
    this.ctx.restore();
    this.defaultStartPoint.x = 0;
    this.defaultStartPoint.y = 0;
    return true;
  }

  private handleSpecialWidget(widget: VerbalObject) {
    const widgetType: string = widget.getAttr("widgetType");
    switch (widgetType) {
      case "line":
        this.handleLineWidget(widget);
        break;
      default:
        return false;
    }
    return true;
  }

  /**
   * 处理绘制line的情况，因为line只需要两点就可以绘制
   * @param widget
   * @returns
   */
  private handleLineWidget(widget: VerbalObject) {
    const style = widget.getAttr("style");
    this.ctx.save();
    VerbalObject.setContextTransform(this.ctx, widget); // 设置上下文变换
    VerbalObject.setContextStyle(this.ctx, widget); // 设置上下文风格s
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(widget.getAttr("width"), widget.getAttr("height"));
    if (style.strokeStyle) this.ctx.stroke();
    this.ctx.restore();
  }

  /**
   * 处理线宽固定问题
   * @param widget
   */
  private handleFixedLineWidth(widget: VerbalObject) {
    const finalLineWidth = this.ctx.lineWidth ?? 1;
    const [finalScaleX, finalScaleY] = getCtxTransformScale(this.ctx); // 获取的scale值可能是经过多次变换叠加出来的
    recoverContextScale(this.ctx);
    // 这里需要再定位一次路径
    this.setContextPath(
      widget,
      widget.getAttr("widgetType"),
      widget.getWidth() * finalScaleX - finalLineWidth,
      widget.getHeight() * finalScaleY - finalLineWidth
    );
  }

  /**
   * 处理线宽导致的溢出问题
   * @param finalLineWidth
   */
  private handleStartWithLineWidth(finalLineWidth: number) {
    const temp = finalLineWidth / 2;
    this.defaultStartPoint.x += temp;
    this.defaultStartPoint.y += temp;
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
    const finalLineWidth = this.ctx.lineWidth ?? 1;
    const finalWidth = width ?? widget.getWidth() - finalLineWidth;
    const finalHeight = height ?? widget.getHeight() - finalLineWidth;
    switch (widgetType) {
      case "rect":
        const cornerRadius = widget.getAttr("cornerRadius");
        this.ctx.beginPath();
        this.ctx.roundRect(
          this.defaultStartPoint.x,
          this.defaultStartPoint.y,
          finalWidth,
          finalHeight,
          cornerRadius
        );
        this.ctx.closePath();
        break;
      case "ellipse":
        const ellipseRadiusX = widget.getAttr("axisX");
        const ellipseRadiusY = widget.getAttr("axisY");
        this.ctx.beginPath();
        this.ctx.ellipse(
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
        this.ctx.beginPath();
        this.ctx.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1; i < vertices.length; ++i)
          this.ctx.lineTo(vertices[i].x, vertices[i].y);
        this.ctx.closePath();
        break;
      default:
        return false;
    }
    return true;
  }
}
