import { Point } from "../common/MathUtils";
import { V_OBJECT_TYPE, VerbalObject } from "./VerbalObject";

export abstract class BaseWidget extends VerbalObject {
  protected widgetType: string = "";
  protected vertices: Point[] = [];
  protected style: Record<string, any> = {};

  constructor(fields: Record<string, any> = {}) {
    super(fields);
    this._initFields(fields);
    this._updateCenterPoint();
    this._updateBoundingBoxVertices();
    this.vObjectType = V_OBJECT_TYPE.WIDGET;
  }

  public getWidgetType() {
    return this.widgetType;
  }

  public getStyle() {
    return this.style;
  }
}
