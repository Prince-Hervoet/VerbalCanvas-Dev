import {
  Point,
  degreesToRadians,
  getCommonRectVertices,
  getNanoId,
  rotatePoint,
  rotateVertices,
} from "../common/MathUtils";
import {
  isNullOrUndefined,
  isAllNullOrUndefined,
  isPlainObject,
  deepClone,
  isObject,
} from "../common/Utils";
import { BaseContainer } from "./BaseContainer";
import {
  EventHandlersType,
  EventHandler,
  SimpleEventType,
  INNER_EVENT_TYPE,
} from "./EventMapping";
import { Painter } from "./Painter";

export interface ITransformData {
  scaleX: number;
  scaleY: number;
  rotate: number;
}

/**
 * 对象所属类型分类
 */
export const V_OBJECT_TYPE = {
  WIDGET: "widget",
  CONTAINER: "container",
};

/**
 * 总元素类
 */
export abstract class VerbalObject implements EventHandler {
  protected vObjectId: string = ""; // 元素id
  protected vObjectType: string = ""; // 元素类型
  protected x: number = 0; // left坐标
  protected y: number = 0; // top坐标
  protected width: number = 0; // 宽度
  protected height: number = 0; // 高度
  protected rotate: number = 0; // 旋转角度
  protected scaleX: number = 1; // x轴缩放系数
  protected scaleY: number = 1; // y轴缩放系数
  protected preTransformObj: VerbalObject | null = null;
  protected centerPoint: Point = { x: 0, y: 0 }; // 中心点
  protected boundingBoxVertices: Point[] = []; // 包围盒顶点数组
  protected parent: BaseContainer | null = null; // 父元素引用
  protected visible: boolean = true; // 是否可见
  protected isPointerEvent: boolean = true; // 是否响应鼠标事件
  protected eventHandlers: EventHandlersType = {}; // 事件处理函数对象
  protected static cacheEventObject: SimpleEventType = {
    veEventName: INNER_EVENT_TYPE._VE_REQUEST_UPDATE,
    target: null,
    currentTarget: null,
    hostMouseEvent: null,
    timeStamp: 0,
  };

  constructor(fields: Record<string, any> = {}) {
    // this._initFields(fields);
    this.vObjectId = getNanoId();
  }

  /**
   * 设置canvas上下文的风格
   * @param ctx
   * @param obj
   * @returns
   */
  static setContextStyle(ctx: CanvasRenderingContext2D, obj: VerbalObject) {
    const style = obj.getAttr("style");
    if (!style || isPlainObject(style)) return;
    for (const key in style) {
      if (key in ctx) (ctx as any)[key] = style[key];
    }
  }

  /**
   * 设置canvas上下文的变换属性
   * @param ctx
   * @param obj
   */
  static setContextTransform(ctx: CanvasRenderingContext2D, obj: VerbalObject) {
    let angle = obj.getRotate();
    if (angle === 0) {
      ctx.translate(obj.x, obj.y);
    } else {
      angle = degreesToRadians(angle);
      ctx.translate(obj.centerPoint.x, obj.centerPoint.y);
      ctx.rotate(angle);
      ctx.translate(obj.x - obj.centerPoint.x, obj.y - obj.centerPoint.y);
    }
    ctx.scale(obj.scaleX, obj.scaleY);
  }

  /**
   * 请求更新
   * @param obj
   */
  protected static requestUpdate(obj: VerbalObject) {
    VerbalObject.cacheEventObject.target = obj;
    VerbalObject.cacheEventObject.currentTarget = obj;
    VerbalObject.cacheEventObject.timeStamp = Date.now();
    obj.eventRun(
      INNER_EVENT_TYPE._VE_REQUEST_UPDATE,
      VerbalObject.cacheEventObject
    );
  }

  /**
   * 初始化字段
   * @param fields
   */
  protected _initFields(fields: Record<string, any>) {
    for (const key in fields) {
      (this as any)[key] = fields[key];
    }
  }

  /**
   * 更新中心点
   */
  protected _updateCenterPoint() {
    this.centerPoint.x = this.x + this.getFinalWidth() / 2;
    this.centerPoint.y = this.y + this.getFinalHeight() / 2;
  }

  /**
   * 更新包围盒点数组
   */
  protected _updateBoundingBoxVertices() {
    let points = getCommonRectVertices(
      this.x,
      this.y,
      this.getFinalWidth(),
      this.getFinalHeight()
    );
    if (this.rotate !== 0)
      points = rotateVertices(points, this.centerPoint, this.rotate, false);
    this.boundingBoxVertices = points;
  }

  /**
   * 子类自己实现的渲染方法
   * @param painter
   */
  protected _render(painter: Painter) {}

  /**
   * 统一渲染调用函数
   * @param painter
   * @returns
   */
  render(painter: Painter) {
    if ((this.width === 0 && this.height === 0) || !this.visible) return;
    const ctx = painter.getContext();
    ctx.save();
    if (this.preTransformObj)
      VerbalObject.setContextTransform(ctx, this.preTransformObj);
    VerbalObject.setContextTransform(ctx, this);
    VerbalObject.setContextStyle(ctx, this);
    this._render(painter);
    ctx.restore();
  }

  /**
   * 导出对象
   * @returns
   */
  toObject(): Record<string, any> {
    const ans: Record<string, any> = {};
    const self: any = this;
    for (const key in self) {
      if (typeof self[key] === "function") continue;
      if (key === "parent") {
        self[key] = null;
        continue;
      }
      if (isObject(self[key]) || Array.isArray(self[key])) {
        if (key === "eventHandlers") continue;
        ans[key] = deepClone(self[key]);
      } else {
        ans[key] = self[key];
      }
    }
    return ans;
  }

  cloneOne(): Record<string, any> {
    const obj = this.toObject();
    obj.vObjectId = getNanoId();
    return obj;
  }

  /**
   * 修正中心点和左上角点的坐标位置，保证旋转拉伸的位置稳定
   */
  protected _fixUpdateCenterPoint() {
    const halfFinalWidth = this.getFinalWidth() / 2;
    const halfFinalHeight = this.getFinalHeight() / 2;
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

  /**
   * 单一属性更新，会请求渲染
   * @param key
   * @param newValue
   */
  update(key: string, newValue: any) {
    this.silentlyUpdate(key, newValue);
    VerbalObject.requestUpdate(this);
  }

  requestUpdate() {
    VerbalObject.requestUpdate(this);
  }

  simplelyMoveCalFields(x: number, y: number) {
    this.x = x;
    this.y = y;
    this._updateCenterPoint();
    VerbalObject.requestUpdate(this);
  }

  /**
   * 自定义更新逻辑
   * @param newValue
   * @param oldValue
   */
  protected _update(
    newValue: Record<string, any>,
    oldValue: Record<string, any>
  ) {}

  protected _fixUpdateFields(
    newValue: Record<string, any>,
    oldValue: Record<string, any>
  ) {
    const { width, height, scaleX, scaleY, x, y, rotate } = newValue;
    // 先判断是否更新了宽高
    if (!isAllNullOrUndefined(width, height, scaleX, scaleY)) {
      if (!isNullOrUndefined(width)) {
        oldValue.width = this.width;
        this.width = width;
      }
      if (!isNullOrUndefined(height)) {
        oldValue.height = this.height;
        this.height = height;
      }
      if (!isNullOrUndefined(scaleX)) {
        oldValue.scaleX = this.scaleX;
        this.scaleX = scaleX;
      }
      if (!isNullOrUndefined(scaleY)) {
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
    if (!isAllNullOrUndefined(x, y, rotate)) {
      if (!isNullOrUndefined(x)) {
        oldValue.x = this.x;
        this.x = newValue.x;
      }
      if (!isNullOrUndefined(y)) {
        oldValue.y = this.y;
        this.y = newValue.y;
      }
      if (!isNullOrUndefined(rotate)) {
        oldValue.rotate = this.rotate;
        this.rotate = newValue.rotate;
      }
      this._updateCenterPoint();
      //   this._updateVertices();
      //   if (this.rotate !== 0) this._rotateVertices();
      delete newValue.x;
      delete newValue.y;
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
    if (key === "x" || key === "y") {
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
      this._fixUpdateCenterPoint();
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

  getFinalWidth() {
    return this.width * this.scaleX;
  }

  getFinalHeight() {
    return this.height * this.scaleY;
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

  getIsPointEvent() {
    return this.isPointerEvent;
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

  /**
   * 转移父亲关系
   * @param nContainer
   * @returns
   */
  transfer(nContainer: BaseContainer | null) {
    if (nContainer === this.parent) return;
    if (this.parent && nContainer) this.parent.remove(this);
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
