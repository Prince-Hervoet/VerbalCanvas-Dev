import {
  Point,
  degreesToRadians,
  getCommonRectVertices,
  getNanoId,
  isEmptyValue,
  isEmptyValues,
  rotatePoint,
} from "../common/MathUtils";
import { BaseContainer } from "./BaseContainer";
import {
  EventHandlersType,
  IEventHandler,
  SimpleEventType,
  VERBAL_EVENT_TYPE,
} from "./EventMapping";
import { IPainter } from "./Painter";

export interface ITransformData {
  scaleX: number;
  scaleY: number;
  rotate: number;
}

export const V_OBJECT_TYPE = {
  WIDGET: "widget",
  CONTAINER: "container",
};

export abstract class VerbalObject implements IEventHandler {
  protected vObjectId: string = "";
  protected vObjectType: string = "";
  protected x: number = 0;
  protected y: number = 0;
  protected width: number = 0;
  protected height: number = 0;
  protected rotate: number = 0;
  protected scaleX: number = 1;
  protected scaleY: number = 1;
  protected centerPoint: Point = { x: 0, y: 0 };
  protected boundingBoxVertices: Point[] = [];
  protected parent: BaseContainer | null = null;
  protected visible: boolean = true;
  protected isPointerEvent: boolean = true;
  protected eventHandlers: EventHandlersType = {};
  protected static cacheEventObject: SimpleEventType = {
    veEventName: "",
    target: null,
    currentTarget: null,
    hostMouseEvent: null,
    timeStamp: 0,
  };

  constructor(fields: Record<string, any> = {}) {
    // this._initFields(fields);
    this.vObjectId = getNanoId();
  }

  public static setContextStyle(
    ctx: CanvasRenderingContext2D,
    obj: VerbalObject
  ) {
    const style = obj.getAttr("style");
    if (!style) return;
    for (const key in style) {
      if (key in ctx) (ctx as any)[key] = style[key];
    }
  }

  public static setContextTransform(
    ctx: CanvasRenderingContext2D,
    obj: VerbalObject
  ) {
    const rotateRad = degreesToRadians(obj.getRotate());
    if (rotateRad !== 0) {
      const centerPoint = obj.getCenterPoint();
      ctx.translate(centerPoint.x, centerPoint.y);
      ctx.rotate(rotateRad);
      ctx.translate(obj.x - centerPoint.x, obj.y - centerPoint.y);
    } else {
      ctx.translate(obj.x, obj.y);
      ctx.scale(obj.scaleX, obj.scaleY);
    }
  }

  protected static requestUpdate(obj: VerbalObject) {
    VerbalObject.cacheEventObject.target = obj;
    VerbalObject.cacheEventObject.veEventName =
      VERBAL_EVENT_TYPE._VE_REQUEST_UPDATE;
    VerbalObject.cacheEventObject.currentTarget = obj;
    VerbalObject.cacheEventObject.timeStamp = Date.now();
    obj.eventRun(
      VERBAL_EVENT_TYPE._VE_REQUEST_UPDATE,
      VerbalObject.cacheEventObject
    );
  }

  protected _initFields(fields: Record<string, any>) {
    for (const key in fields) {
      (this as any)[key] = fields[key];
    }
  }

  protected _updateCenterPoint() {
    this.centerPoint.x = this.x + (this.width * this.scaleX) / 2;
    this.centerPoint.y = this.y + (this.height * this.scaleY) / 2;
  }

  protected _updateBoundingBoxVertices() {
    const points = getCommonRectVertices(
      this.x,
      this.y,
      this.width,
      this.height
    );
    if (this.rotate !== 0)
      for (let i = 0; i < points.length; ++i)
        points[i] = rotatePoint(points[i], this.centerPoint, this.rotate);
    this.boundingBoxVertices = points;
  }

  protected _render(painter: IPainter) {}

  render(painter: IPainter) {
    if ((this.width === 0 && this.height === 0) || !this.visible) return;
    const ctx = painter.getContext();
    ctx.save();
    VerbalObject.setContextTransform(ctx, this);
    VerbalObject.setContextStyle(ctx, this);
    this._render(painter);
    ctx.restore();
  }

  protected _fixUpdateCenterPoint() {
    const halfFinalWidth = (this.width * this.scaleX) / 2;
    const halfFinalHeight = (this.height * this.scaleY) / 2;
    const nCenterPoint = {
      x: this.x + halfFinalWidth,
      y: this.y + halfFinalHeight,
    };
    this.centerPoint = rotatePoint(nCenterPoint, this.centerPoint, this.rotate);
    this.x = this.centerPoint.x - halfFinalWidth;
    this.y = this.centerPoint.y - halfFinalHeight;
  }

  /**
   * 同时设置多个属性，可以设置是否动态更新
   * @param newValue
   * @param isRequestUpate
   */
  setFields(newValue: Record<string, any>, isRequestUpate: boolean) {
    const copyValue = Object.assign({}, newValue);
    const oldValue: any = {};
    const self: any = this;
    this._fixUpdateFields(copyValue, oldValue);
    for (const key in copyValue) {
      oldValue[key] = self[key];
      self[key] = copyValue[key];
    }
    this._update(newValue, oldValue);
    if (isRequestUpate) VerbalObject.requestUpdate(this);
  }

  /**
   * 静默更新 -- 不自动更新
   * @param key
   * @param newValue
   * @returns
   */
  silentlyUpdate(key: string, newValue: any) {
    if (!(key in this)) return;
    const self: any = this;
    const oldValue = { [key]: self[key] };
    self[key] = newValue;
    this._fixUpdateFieldByKey(key);
    this._update({ [key]: newValue }, oldValue);
  }

  update(key: string, newValue: any) {
    this.silentlyUpdate(key, newValue);
    VerbalObject.requestUpdate(this);
  }

  simplelyMoveCalFields(x: number, y: number) {
    this.x = x;
    this.y = y;
    this._updateCenterPoint();
    VerbalObject.requestUpdate(this);
  }

  protected _update(
    newValue: Record<string, any>,
    oldValue: Record<string, any>
  ) {}

  protected _fixUpdateFields(
    newValue: Record<string, any>,
    oldValue: Record<string, any>
  ) {
    const { width, height, scaleX, scaleY, left, top, rotate } = newValue;
    if (!isEmptyValues(width, height, scaleX, scaleY)) {
      if (!isEmptyValue(width)) {
        oldValue.width = this.width;
        this.width = width;
      }
      if (!isEmptyValue(height)) {
        oldValue.height = this.height;
        this.height = height;
      }
      if (!isEmptyValue(scaleX)) {
        oldValue.scaleX = this.scaleX;
        this.scaleX = scaleX;
      }
      if (!isEmptyValue(scaleY)) {
        oldValue.scaleY = this.scaleY;
        this.scaleY = scaleY;
      }
      if (this.rotate === 0) this._updateCenterPoint();
      else this._fixUpdateCenterPoint();
      //   this._updateVertices();
      //   if (this.rotate !== 0) this._rotateVertices();
      delete newValue.width;
      delete newValue.height;
      delete newValue.scaleX;
      delete newValue.scaleY;
    }
    if (!isEmptyValues(top, left, rotate)) {
      if (!isEmptyValue(left)) {
        oldValue.left = this.x;
        this.y = newValue.left;
      }
      if (!isEmptyValue(top)) {
        oldValue.top = this.y;
        this.y = newValue.top;
      }
      if (!isEmptyValue(rotate)) {
        oldValue.rotate = this.rotate;
        this.rotate = newValue.rotate;
      }
      this._updateCenterPoint();
      //   this._updateVertices();
      //   if (this.rotate !== 0) this._rotateVertices();
      delete newValue.top;
      delete newValue.left;
      delete newValue.rotate;
    }
    this._updateBoundingBoxVertices();
  }

  protected _fixUpdateFieldByKey(key: string) {
    if (key === "rotate") {
      //   this._updateVertices();
      //   this._rotateVertices();
      this._updateBoundingBoxVertices();
      return;
    }
    if (this.rotate === 0) {
      this._updateCenterPoint();
      //   this._updateVertices();
      this._updateBoundingBoxVertices();
      return;
    }
    if (key === "top" || key === "left") {
      this._updateCenterPoint();
      //   this._updateVertices();
      //   this._rotateVertices();
      this._updateBoundingBoxVertices();
      return;
    }
    if (
      key === "width" ||
      key === "height" ||
      key === "scaleX" ||
      key === "scaleY"
    ) {
      const halfFinalWidth = (this.width * this.scaleX) / 2;
      const halfFinalHeight = (this.height * this.scaleY) / 2;
      const nCenterPoint = {
        x: this.x + halfFinalWidth,
        y: this.y + halfFinalHeight,
      };
      this.centerPoint = rotatePoint(
        nCenterPoint,
        this.centerPoint,
        this.rotate
      );
      this.x = this.centerPoint.x - halfFinalWidth;
      this.y = this.centerPoint.y - halfFinalHeight;
      //   this._updateVertices();
      //   this._rotateVertices();
      this._updateBoundingBoxVertices();
    }
  }

  getAttr(key: string): any {
    return (this as any)[key];
  }

  setAttr(key: string, value: any) {
    (this as any)[key] = value;
  }

  getObjectId() {
    return this.vObjectId;
  }

  getObjectType() {
    return this.vObjectType;
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getParent() {
    return this.parent;
  }

  getRotate() {
    return this.rotate;
  }

  getScaleX() {
    return this.scaleX;
  }

  getScaleY() {
    return this.scaleY;
  }

  getVisible() {
    return this.visible;
  }

  isPointInObject(point: Point): boolean {
    return false;
  }

  getCenterPoint() {
    return this.centerPoint;
  }

  public getBoundingBoxVertices() {
    return this.boundingBoxVertices;
  }

  transfer(nContainer: BaseContainer | null) {
    if (nContainer === this.parent) return;
    if (this.parent) this.parent.remove(this);
    // if (nContainer) nContainer.place(this);
    this.parent = nContainer;
  }

  eventOn(name: string, handler: Function): void {
    if (!this.eventHandlers[name]) this.eventHandlers[name] = [];
    this.eventHandlers[name].push(handler);
  }

  eventOff(name: string, handler?: Function | undefined): void {
    if (!handler) {
      delete this.eventHandlers[name];
    } else {
      this.eventHandlers[name] = this.eventHandlers[name].filter(
        (value: Function) => {
          return value !== handler;
        }
      );
    }
  }

  eventRun(name: string, ...args: any[]): void {
    if (!this.eventHandlers[name]) return;
    this.eventHandlers[name].forEach((value: Function) => {
      value.call(null, ...args);
    });
  }

  hasEvent(name: string): boolean {
    return this.eventHandlers.hasOwnProperty(name);
  }
}
