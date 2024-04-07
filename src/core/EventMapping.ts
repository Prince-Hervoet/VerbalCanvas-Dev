import { VerbalObject } from "./VerbalObject";
import { VerbalLayer } from "./VerbalLayer";

/**
 * 内部事件类型
 */
export const VERBAL_EVENT_TYPE = {
  VE_CLICK: "ve-click",
  VE_MOUSEDOWN: "ve-mousedown",
  VE_MOUSEUP: "ve-mouseup",
  VE_MOUSEMOVE: "ve-mousemove",
  _VE_REQUEST_UPDATE: "_ve-request-update",
};

/**
 * 简单事件对象接口
 */
export interface ISimpleEvent {
  veEventName: string;
  target: VerbalObject | null;
  hostMouseEvent: MouseEvent | null;
  timeStamp: number;
}

export interface IEventHandler {
  eventOn(name: string, handler: Function): void;
  eventOff(name: string, handler?: Function): void;
  eventRun(name: string, ...args: any[]): void;
}

export function createSimpleEvent(
  veEventName: string,
  target: VerbalObject | null,
  hostMouseEvent: MouseEvent | null
) {
  return {
    veEventName,
    target,
    hostMouseEvent,
    timeStamp: Date.now(),
  };
}

/**
 * 绑定事件映射器，将浏览器的基本鼠标事件映射到canvas画布上
 * @param verbal
 */
export function bindEventMapping(verbal: VerbalLayer) {
  const handler = (hostMouseEvent: MouseEvent, veEventName: string) => {
    const widget = verbal.isPointInOneObject({
      x: hostMouseEvent.offsetX,
      y: hostMouseEvent.offsetY,
    });
    if (widget) {
      const eventArgs = createSimpleEvent(veEventName, widget, hostMouseEvent);
      let flag: VerbalObject | null = widget;
      while (flag) {
        flag.eventRun(veEventName, eventArgs);
        flag = flag.getParent();
      }
    } else {
      verbal.eventRun(
        veEventName,
        createSimpleEvent(veEventName, verbal, hostMouseEvent)
      );
    }
  };

  const targetDom = verbal.getCanvasDom();
  const eventMapping = {
    click: (event: MouseEvent) => {
      handler(event, VERBAL_EVENT_TYPE.VE_CLICK);
    },
    mousedown: (event: MouseEvent) => {
      handler(event, VERBAL_EVENT_TYPE.VE_MOUSEDOWN);
    },
    mouseup: (event: MouseEvent) => {
      handler(event, VERBAL_EVENT_TYPE.VE_MOUSEUP);
    },
    mousemove: (event: MouseEvent) => {
      handler(event, VERBAL_EVENT_TYPE.VE_MOUSEMOVE);
    },
  };
  targetDom.addEventListener("click", eventMapping.click);
  targetDom.addEventListener("mousedown", eventMapping.mousedown);
  targetDom.addEventListener("mouseup", eventMapping.mouseup);
  targetDom.addEventListener("mousemove", eventMapping.mousemove);
  return eventMapping;
}

export function unbindEventMapping(
  verbal: VerbalLayer,
  eventMapping: Record<string, (event: MouseEvent) => void>
) {
  const targetDom = verbal.getCanvasDom();
  if (eventMapping.click)
    targetDom.removeEventListener("click", eventMapping.click);
  if (eventMapping.mousedown)
    targetDom.removeEventListener("mousedown", eventMapping.mousedown);
  if (eventMapping.mouseup)
    targetDom.removeEventListener("mouseup", eventMapping.mouseup);
  if (eventMapping.mousemove)
    targetDom.removeEventListener("mousemove", eventMapping.mousemove);
}
