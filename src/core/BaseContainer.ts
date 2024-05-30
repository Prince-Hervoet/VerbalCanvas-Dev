import { V_OBJECT_TYPE, VerbalObject } from "./VerbalObject";

/**
 * 容器类型分类
 */
export const V_CONTAINER_TYPE = {
  GROUP: "group",
  COMBINATION: "combination",
  MULTIPLE_SELECT_LIST: "multipleSelectList",
  VERBAL_LAYER: "verbalLayer",
};

/**
 * 容器类
 */
export abstract class BaseContainer extends VerbalObject {
  protected containerType: string = ""; // 容器类型

  /**
   * 放置元素
   * @param obj
   */
  abstract place(...objs: VerbalObject[]): void;

  /**
   * 放置一列元素
   * @param objs
   */
  abstract placeArray(objs: VerbalObject[]): void;

  /**
   * 移除元素
   * @param obj
   */
  abstract remove(...objs: VerbalObject[]): void;

  /**
   * 清空
   */
  abstract clear(): void;

  /**
   * 获取成员数量
   */
  abstract size(): number;

  /**
   * 是否包含某个元素
   * @param obj
   */
  abstract contains(obj: VerbalObject): boolean;

  constructor(fields: Record<string, any> = {}) {
    super(fields);
    this._initFields(fields);
    this.vObjectType = V_OBJECT_TYPE.CONTAINER;
  }

  /**
   * 获取容器类型
   * @returns
   */
  public getContainerType() {
    return this.containerType;
  }
}
