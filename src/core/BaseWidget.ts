import { Point } from "../common/MathUtils";
import { deepClone } from "../common/Utils";
import { V_OBJECT_TYPE, VerbalObject } from "./VerbalObject";

/**
 * 部件类型分类
 */
export const V_WIDGET_TYPE = {
  RECT: "rect",
  ELLIPSE: "ellipse",
  PICTURE: "picture",
  LINE: "line",
  POLYGON: "polygon",
};

/**
 * 部件类
 */
export abstract class BaseWidget extends VerbalObject {
  protected widgetType: string = ""; // 部件类型
  protected vertices: Point[] = []; // 部件顶点数组
  protected style: Record<string, any> = {}; // 风格对象
  protected isFixedLineWidth: boolean = false; // 是否固定描边线宽

  constructor(fields: Record<string, any> = {}) {
    super(fields);
    this._initFields(fields);
    this._updateCenterPoint();
    this._updateBoundingBoxVertices();
    this.vObjectType = V_OBJECT_TYPE.WIDGET;
  }

  /**
   * 获取部件类型
   * @returns
   */
  getWidgetType() {
    return this.widgetType;
  }

  /**
   * 获取风格对象
   * @returns
   */
  getStyle() {
    return this.style;
  }
}
