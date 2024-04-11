import { Point } from "../common/MathUtils";
import { SimpleHashList } from "../common/SimpleHashList";
import { BaseContainer, V_CONTAINER_TYPE } from "./BaseContainer";
import { Canvas } from "./Canvas";
import { INNER_EVENT_TYPE } from "./EventMapping";
import { VerbalObject } from "./VerbalObject";
import { BasePainter, Painter } from "./Painter";

export class VerbalLayer extends BaseContainer {
  private canvas: Canvas;
  private painter: Painter;
  private objectList: SimpleHashList<string, VerbalObject> =
    new SimpleHashList();
  private isRenderFlag: boolean = true;

  constructor(canvas: Canvas, painter?: Painter) {
    super();
    this.canvas = canvas;
    if (painter) this.painter = painter;
    else this.painter = new BasePainter(this.canvas.getContext());
    this.deleteNeedlessFields();
    this.containerType = V_CONTAINER_TYPE.VERBAL_LAYER;
  }

  private deleteNeedlessFields() {
    const self: any = this;
    delete self.x;
    delete self.y;
    delete self.width;
    delete self.height;
    delete self.rotate;
    delete self.scaleX;
    delete self.scaleY;
    delete self.boundingBoxVertices;
  }

  getCanvas() {
    return this.canvas;
  }

  getCanvasDom() {
    return this.canvas.getCanvasDom();
  }

  layerRender(): void {
    this.erasure();
    let flag = this.objectList.getHead();
    while (flag) {
      const obj: VerbalObject = flag.getValue();
      if (obj.getVisible()) this.renderControl(obj);
      flag = flag.next;
    }
  }

  place(...objs: VerbalObject[]): void {
    let has = false;
    for (const obj of objs) {
      if (!obj) continue;
      if (this.objectList.insertLast(obj.getObjectId(), obj)) {
        has = true;
        this.bindRequestUpdateEvent(obj);
        obj.transfer(this);
      }
    }
    if (has) this.layerRender();
  }

  remove(...objs: VerbalObject[]): void {
    let has = false;
    for (const obj of objs) {
      if (!obj) continue;
      if (this.objectList.remove(obj.getObjectId())) {
        has = true;
        this.removeRequestUpdateEvent(obj);
        obj.transfer(this);
      }
    }
    if (has) this.layerRender();
  }

  contains(obj: VerbalObject): boolean {
    return this.objectList.contains(obj.getObjectId());
  }

  /**
   * 获取点在哪一个元素上
   * @param x
   * @param y
   * @returns
   */
  isPointInOneObject(point: Point): VerbalObject | null {
    if (this.objectList.getSize() === 0) return null;
    let flag = this.objectList.getTail();
    while (flag) {
      const widget = flag.getValue();
      if (widget.getIsPointEvent())
        if (widget.isPointInObject(point)) return widget;
      flag = flag.prev;
    }
    return null;
  }

  /**
   * 清空画布，不会清空list
   */
  public erasure() {
    const ctx = this.canvas.getContext();
    ctx.clearRect(0, 0, this.canvas.getWidth(), this.canvas.getHeight());
  }

  /**
   * 清空list
   */
  public clear() {
    this.erasure();
    this.objectList.clear();
  }

  /**
   * 批量更新处理函数
   * @param event
   * @returns
   */
  private requestUpdateHandler = (event: any) => {
    if (!this.isRenderFlag) return;
    this.isRenderFlag = false;
    requestAnimationFrame(() => {
      if (event && this.contains(event.target)) this.layerRender();
      this.isRenderFlag = true;
    });
  };

  /**
   * 渲染控制方法
   * @param widget
   * @returns
   */
  private renderControl(obj: VerbalObject) {
    const ctx = this.canvas.getContext();
    let result = false;
    ctx.save();
    result = this.painter.draw(obj);
    ctx.restore();
    if (result) return;
    ctx.save();
    obj.render(this.painter);
    ctx.restore();
  }

  private bindRequestUpdateEvent(obj: VerbalObject) {
    obj.eventOn(INNER_EVENT_TYPE._VE_REQUEST_UPDATE, this.requestUpdateHandler);
  }

  private removeRequestUpdateEvent(obj: VerbalObject) {
    obj.eventOff(INNER_EVENT_TYPE._VE_REQUEST_UPDATE);
  }
}
