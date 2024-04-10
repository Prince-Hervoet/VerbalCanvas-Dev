import { VerbalObject } from "./VerbalObject";
import { VerbalLayer } from "./VerbalLayer";
import { Canvas } from "./Canvas";

/**
 * 内部事件类型
 */
export const INNER_EVENT_TYPE = {
  VE_CLICK: "ve-click",
  VE_MOUSEDOWN: "ve-mousedown",
  VE_MOUSEUP: "ve-mouseup",
  VE_MOUSEMOVE: "ve-mousemove",
  VE_MOUSEOVER: "ve-mouseover",
  VE_MOUSEOUT: "ve-mouseout",
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
 * TODO: 将事件类封装完全
 */
export class EventController {
  private eventMapping: Record<string, (event: MouseEvent) => void> | null =
    null;
  private overRecord: VerbalObject | null = null;
  private verbalLayer: VerbalLayer;
  private cacheMousePoint = { x: 0, y: 0 }; // 缓存鼠标坐标点
  private cacheEventObject: SimpleEventType = {
    veEventName: "",
    target: null,
    currentTarget: null,
    hostMouseEvent: null,
    timeStamp: 0,
  }; // 缓存事件对象

  constructor(verbalLayer: VerbalLayer) {
    this.verbalLayer = verbalLayer;
  }

  bindEventMapping() {
    if (this.eventMapping) return;
    this.eventMapping = {
      click: (event: MouseEvent) => {
        this.commonMappingHandler(event, INNER_EVENT_TYPE.VE_CLICK);
      },
      mousedown: (event: MouseEvent) => {
        this.commonMappingHandler(event, INNER_EVENT_TYPE.VE_MOUSEDOWN);
      },
      mouseup: (event: MouseEvent) => {
        this.commonMappingHandler(event, INNER_EVENT_TYPE.VE_MOUSEUP);
      },
      mousemove: (event: MouseEvent) => {
        this.mouseMoveHandler(event, INNER_EVENT_TYPE.VE_MOUSEMOVE);
      },
    };
    const targetDom = this.verbalLayer.getCanvasDom();
    targetDom.addEventListener("click", this.eventMapping.click);
    targetDom.addEventListener("mousedown", this.eventMapping.mousedown);
    targetDom.addEventListener("mouseup", this.eventMapping.mouseup);
    targetDom.addEventListener("mousemove", this.eventMapping.mousemove);
  }

  unbindEventMapping() {
    if (!this.eventMapping) return;
    const targetDom = this.verbalLayer.getCanvasDom();
    if (this.eventMapping.click)
      targetDom.removeEventListener("click", this.eventMapping.click);
    if (this.eventMapping.mousedown)
      targetDom.removeEventListener("mousedown", this.eventMapping.mousedown);
    if (this.eventMapping.mouseup)
      targetDom.removeEventListener("mouseup", this.eventMapping.mouseup);
    if (this.eventMapping.mousemove)
      targetDom.removeEventListener("mousemove", this.eventMapping.mousemove);
    this.eventMapping = null;
  }

  private commonMappingHandler = (
    hostMouseEvent: MouseEvent,
    veEventName: string
  ) => {
    this.cacheMousePoint.x = hostMouseEvent.offsetX; // 每次都赋值而不是创建新的对象
    this.cacheMousePoint.y = hostMouseEvent.offsetY;
    const widget = this.verbalLayer.isPointInOneObject(this.cacheMousePoint);
    this.cacheEventObject.veEventName = veEventName;
    this.cacheEventObject.hostMouseEvent = hostMouseEvent;
    if (!widget) {
      if (!this.verbalLayer.hasEvent(veEventName)) return;
      this.cacheEventObject.target = this.verbalLayer;
      this.cacheEventObject.currentTarget = this.verbalLayer;
      this.verbalLayer.eventRun(veEventName, this.cacheEventObject);
      return;
    }
    this.cacheEventObject.target = widget;
    let flag: VerbalObject | null = widget;
    while (flag) {
      this.cacheEventObject.currentTarget = flag;
      flag.eventRun(veEventName, this.cacheEventObject);
      flag = flag.getParent();
    }
  };

  private mouseMoveHandler = (
    hostMouseEvent: MouseEvent,
    veEventName: string
  ) => {
    this.cacheMousePoint.x = hostMouseEvent.offsetX; // 每次都赋值而不是创建新的对象
    this.cacheMousePoint.y = hostMouseEvent.offsetY;
    const widget = this.verbalLayer.isPointInOneObject(this.cacheMousePoint);
    this.cacheEventObject.hostMouseEvent = hostMouseEvent;
    if (!widget) {
      if (this.overRecord) {
        // 说明要出发out事件
        this.cacheEventObject.veEventName = INNER_EVENT_TYPE.VE_MOUSEOUT;
        let flag: VerbalObject | null = this.overRecord;
        while (flag) {
          this.cacheEventObject.currentTarget = flag;
          flag.eventRun(INNER_EVENT_TYPE.VE_MOUSEOUT, this.cacheEventObject);
          flag = flag.getParent();
        }
        this.overRecord = null;
      }
      this.cacheEventObject.veEventName = veEventName;
      if (!this.verbalLayer.hasEvent(veEventName)) return;
      this.cacheEventObject.target = this.verbalLayer;
      this.cacheEventObject.currentTarget = this.verbalLayer;
      this.verbalLayer.eventRun(veEventName, this.cacheEventObject);
      return;
    }
    this.cacheEventObject.target = widget;
    let flag: VerbalObject | null = widget;
    if (this.overRecord === null) {
      // 说明要出发over事件
      this.cacheEventObject.veEventName = INNER_EVENT_TYPE.VE_MOUSEOVER;
      while (flag) {
        this.cacheEventObject.currentTarget = flag;
        flag.eventRun(INNER_EVENT_TYPE.VE_MOUSEOVER, this.cacheEventObject);
        flag = flag.getParent();
      }
      this.overRecord = widget;
    }
    this.cacheEventObject.veEventName = veEventName;
    flag = widget;
    while (flag) {
      this.cacheEventObject.currentTarget = flag;
      flag.eventRun(veEventName, this.cacheEventObject);
      flag = flag.getParent();
    }
  };
}

export function createInnerHandler(verbal: VerbalLayer) {
  const cacheMousePoint = { x: 0, y: 0 }; // 缓存鼠标坐标点
  const cacheEventObject: SimpleEventType = {
    veEventName: "",
    target: null,
    currentTarget: null,
    hostMouseEvent: null,
    timeStamp: 0,
  }; // 缓存事件对象
  let cacheOverWidget: VerbalObject | null = null;
  const commonInnerHandler = (
    hostMouseEvent: MouseEvent,
    veEventName: string
  ) => {
    cacheMousePoint.x = hostMouseEvent.offsetX; // 每次都赋值而不是创建新的对象
    cacheMousePoint.y = hostMouseEvent.offsetY;
    const widget = verbal.isPointInOneObject(cacheMousePoint);
    cacheEventObject.veEventName = veEventName;
    cacheEventObject.hostMouseEvent = hostMouseEvent;
    if (!widget) {
      if (!verbal.hasEvent(veEventName)) return;
      cacheEventObject.target = verbal;
      cacheEventObject.currentTarget = verbal;
      verbal.eventRun(veEventName, cacheEventObject);
      return;
    }
    cacheEventObject.target = widget;
    let flag: VerbalObject | null = widget;
    while (flag) {
      cacheEventObject.currentTarget = flag;
      flag.eventRun(veEventName, cacheEventObject);
      flag = flag.getParent();
    }
  };

  const mouseMoveHandler = (
    hostMouseEvent: MouseEvent,
    veEventName: string
  ) => {
    cacheMousePoint.x = hostMouseEvent.offsetX; // 每次都赋值而不是创建新的对象
    cacheMousePoint.y = hostMouseEvent.offsetY;
    const widget = verbal.isPointInOneObject(cacheMousePoint);
    cacheEventObject.hostMouseEvent = hostMouseEvent;
    if (!widget) {
      if (cacheOverWidget) {
        // 说明要出发out事件
        cacheEventObject.veEventName = INNER_EVENT_TYPE.VE_MOUSEOUT;
        let flag: VerbalObject | null = cacheOverWidget;
        while (flag) {
          cacheEventObject.currentTarget = flag;
          flag.eventRun(INNER_EVENT_TYPE.VE_MOUSEOUT, cacheEventObject);
          flag = flag.getParent();
        }
        cacheOverWidget = null;
      }
      if (!verbal.hasEvent(veEventName)) return;
      cacheEventObject.target = verbal;
      cacheEventObject.currentTarget = verbal;
      verbal.eventRun(veEventName, cacheEventObject);
      return;
    }
    cacheEventObject.target = widget;
    let flag: VerbalObject | null = widget;
    if (!cacheOverWidget) {
      // 说明要出发over事件
      cacheEventObject.veEventName = INNER_EVENT_TYPE.VE_MOUSEOVER;
      while (flag) {
        cacheEventObject.currentTarget = flag;
        flag.eventRun(INNER_EVENT_TYPE.VE_MOUSEOVER, cacheEventObject);
        flag = flag.getParent();
      }
      cacheOverWidget = widget;
    }
    flag = widget;
    cacheEventObject.veEventName = INNER_EVENT_TYPE.VE_MOUSEMOVE;
    while (flag) {
      cacheEventObject.currentTarget = flag;
      flag.eventRun(veEventName, cacheEventObject);
      flag = flag.getParent();
    }
  };
  return [commonInnerHandler, mouseMoveHandler];
}

/**
 * 绑定事件映射器，将浏览器的基本鼠标事件映射到canvas画布上
 * @param verbal
 */
export function bindEventMapping(verbal: VerbalLayer) {
  const [commonInnerHandler, mouseMoveHandler] = createInnerHandler(verbal);
  const eventMapping = {
    click: (event: MouseEvent) => {
      commonInnerHandler(event, INNER_EVENT_TYPE.VE_CLICK);
    },
    mousedown: (event: MouseEvent) => {
      commonInnerHandler(event, INNER_EVENT_TYPE.VE_MOUSEDOWN);
    },
    mouseup: (event: MouseEvent) => {
      commonInnerHandler(event, INNER_EVENT_TYPE.VE_MOUSEUP);
    },
    mousemove: (event: MouseEvent) => {
      mouseMoveHandler(event, INNER_EVENT_TYPE.VE_MOUSEMOVE);
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
