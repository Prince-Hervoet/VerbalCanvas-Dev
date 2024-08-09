import { Point } from "../common/MathUtils";
import { isNullOrUndefined } from "../common/Utils";
import { VerbalLayer } from "./VerbalLayer";

export enum VerbalInnerEventEnum {
  VE_MOUSE_MOVE = 0,
  VE_CLICK = 1,
  VE_MOUSE_DOWN = 2,
  VE_MOUSE_UP = 3,
  VE_MOUSE_OVER = 4,
  VE_MOUSE_OUT = 5,
  _VE_INNER_UPDATE = 999,
}

enum BroswerEventType {
  MOUSE_MOVE = "mousemove",
  CLICK = "click",
}

/**
 * 浏览器原生事件映射器
 */
export class BroswerEventMapper {
  private verbalLayer: VerbalLayer;
  private isStartEvent: boolean;
  private mousePositionCache: Point = { x: 0, y: 0 };

  constructor(verbalLayer: VerbalLayer) {
    this.verbalLayer = verbalLayer;
    this.isStartEvent = false;
  }

  startEvent() {
    if (this.isStartEvent) return;
    this.isStartEvent = true;
    this.bindEvent();
  }

  stopEvent() {
    if (!this.isStartEvent) return;
    this.isStartEvent = false;
    this.unbindEvent();
  }

  private broswerEventOnOneObject(event: MouseEvent) {
    if (isNullOrUndefined(event)) return;
    this.mousePositionCache.x = event.offsetX;
    this.mousePositionCache.y = event.offsetY;
    return this.verbalLayer.judgePointInOneObject(this.mousePositionCache);
  }

  private bindEventHandler = (event: MouseEvent) => {
    if (isNullOrUndefined(event)) return;
    const eventType: string = event.type;
    switch (eventType) {
      case BroswerEventType.CLICK:
        break;
    }
  };

  private bindEvent() {
    const canvas = this.verbalLayer.getCanvas();
    const canvasDom = canvas.getCanvasDom();
    canvasDom.addEventListener("click", this.bindEventHandler);
    canvasDom.addEventListener("mousemove", this.bindEventHandler);
    canvasDom.addEventListener("mousedown", this.bindEventHandler);
    canvasDom.addEventListener("mouseup", this.bindEventHandler);
  }

  private unbindEvent() {
    const canvas = this.verbalLayer.getCanvas();
    const canvasDom = canvas.getCanvasDom();
    canvasDom.removeEventListener("click", this.bindEventHandler);
    canvasDom.removeEventListener("mousemove", this.bindEventHandler);
    canvasDom.removeEventListener("mousedown", this.bindEventHandler);
    canvasDom.removeEventListener("mouseup", this.bindEventHandler);
  }
}
