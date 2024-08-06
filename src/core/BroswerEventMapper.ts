import { Canvas } from "./Canvas";

export enum VerbalInnerEventEnum {
  VE_MOUSE_MOVE = 0,
  VE_CLICK = 1,
  VE_MOUSE_DOWN = 2,
  VE_MOUSE_UP = 3,
  VE_MOUSE_OVER = 4,
  VE_MOUSE_OUT = 5,
  _VE_INNER_UPDATE = 999,
}

/**
 * 浏览器原生事件映射器
 */
export class BroswerEventMapper {
  private targetCanvas: Canvas; // 要映射的 Canvas 元素
  private isStartEvent: boolean;

  constructor(targetCanvas: Canvas) {
    this.targetCanvas = targetCanvas;
    this.isStartEvent = false;
  }

  startEvent() {}

  private bindEvent() {
    const canvasDom = this.targetCanvas.getCanvasDom();
    canvasDom.addEventListener("click", (event: any) => {});
  }
}
