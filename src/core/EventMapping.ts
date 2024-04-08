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
export interface SimpleEventType {
  veEventName: string;
  target: VerbalObject | null;
  currentTarget: VerbalObject | null;
  hostMouseEvent: MouseEvent | null;
  timeStamp: number;
}

/**
 * 事件订阅触发处理接口
 */
export interface IEventHandler {
  eventOn(name: string, handler: Function): void;
  eventOff(name: string, handler?: Function): void;
  eventRun(name: string, ...args: any[]): void;
  hasEvent(name: string): boolean;
}

/**
 * 事件处理函数集合类型
 */
export type EventHandlersType = {
  [property: string]: Function[];
};

/**
 * 绑定事件映射器，将浏览器的基本鼠标事件映射到canvas画布上
 * @param verbal
 */
export function bindEventMapping(verbal: VerbalLayer) {
  const cacheMousePoint = { x: 0, y: 0 }; // 缓存鼠标坐标点
  const cacheEventObject: SimpleEventType = {
    veEventName: "",
    target: verbal,
    currentTarget: verbal,
    hostMouseEvent: null,
    timeStamp: 0,
  }; // 缓存事件对象
  const handler = (hostMouseEvent: MouseEvent, veEventName: string) => {
    cacheMousePoint.x = hostMouseEvent.offsetX; // 每次都赋值而不是创建新的对象
    cacheMousePoint.y = hostMouseEvent.offsetY;
    const widget = verbal.isPointInOneObject(cacheMousePoint);
    cacheEventObject.veEventName = veEventName;
    cacheEventObject.hostMouseEvent = hostMouseEvent;
    if (widget) {
      cacheEventObject.target = widget;
      let flag: VerbalObject | null = widget;
      while (flag) {
        cacheEventObject.currentTarget = flag;
        flag.eventRun(veEventName, cacheEventObject);
        flag = flag.getParent();
      }
    } else {
      if (!verbal.hasEvent(veEventName)) return;
      cacheEventObject.target = verbal;
      cacheEventObject.currentTarget = verbal;
      verbal.eventRun(veEventName, cacheEventObject);
    }
  };
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
  const targetDom = verbal.getCanvasDom();
  targetDom.addEventListener("click", eventMapping.click);
  targetDom.addEventListener("mousedown", eventMapping.mousedown);
  targetDom.addEventListener("mouseup", eventMapping.mouseup);
  targetDom.addEventListener("mousemove", eventMapping.mousemove);
  return eventMapping;
}

/**
 * 解绑事件监听
 * @param verbal
 * @param eventMapping
 */
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
