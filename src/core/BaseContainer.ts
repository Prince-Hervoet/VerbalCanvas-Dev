import { V_OBJECT_TYPE, VerbalObject } from "./VerbalObject";

export const V_CONTAINER_TYPE = {
  GROUP: "group",
  VERBAL_LAYER: "verbalLayer",
};

export abstract class BaseContainer extends VerbalObject {
  protected containerType: string = "";

  abstract place(...obj: VerbalObject[]): void;
  abstract remove(...obj: VerbalObject[]): void;
  abstract contains(obj: VerbalObject): boolean;

  constructor(fields: Record<string, any> = {}) {
    super(fields);
    this._initFields(fields);
    this.vObjectType = V_OBJECT_TYPE.CONTAINER;
  }

  public getContainerType() {
    return this.containerType;
  }
}
