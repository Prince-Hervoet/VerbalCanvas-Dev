import {
  Point,
  getGroupBoundingBox,
  isPointInPolygon,
  rotatePoint,
} from "../common/MathUtils";
import { ShlType, SimpleHashList } from "../common/SimpleHashList";
import { hasProperty } from "../common/Utils";
import { BaseContainer, V_CONTAINER_TYPE } from "./BaseContainer";
import { VerbalObject } from "./VerbalObject";

export class Group extends BaseContainer {
  private members: ShlType<string, VerbalObject> = new SimpleHashList();

  constructor() {
    super();
    this.containerType = V_CONTAINER_TYPE.GROUP;
  }

  /**
   * 更新和重置组的属性
   */
  protected _updateGroupFields() {
    const bbs: Point[][] = [];
    this.members.traverseForward((key: string, value: VerbalObject) => {
      bbs.push(value.getBoundingBoxVertices());
    });
    const { minX, minY, maxX, maxY } = getGroupBoundingBox(bbs);
    this.x = minX;
    this.y = minY;
    this.width = maxX - minX;
    this.height = maxY - minY;
    this.rotate = 0;
    this._updateCenterPoint();
    this._updateBoundingBoxVertices();
  }

  place(...objs: VerbalObject[]): void {
    this.placeArray(objs);
  }

  placeArray(objs: VerbalObject[]): void {
    for (const obj of objs) this.members.insertLast(obj.getObjectId(), obj);
    this._updateGroupFields();
  }

  remove(...objs: VerbalObject[]): void {
    for (const obj of objs) this.members.remove(obj.getObjectId());
    this._updateGroupFields();
  }

  clear(): void {
    this.members.clear();
  }

  contains(obj: VerbalObject): boolean {
    return this.members.contains(obj.getObjectId());
  }

  size(): number {
    return this.members.size();
  }

  protected _update(
    newValue: Record<string, any>,
    oldValue: Record<string, any>
  ): void {
    this.updateMemberFields(newValue, oldValue);
  }

  private updateMemberFields(
    newValue: Record<string, any>,
    oldValue: Record<string, any>
  ) {
    if (hasProperty(newValue, "x")) {
      const offsetX = newValue.x - oldValue.x;
      this.members.traverseForward((key: string, value: VerbalObject) => {
        value.silentlyUpdate("x", value.getAttr("x") + offsetX);
      });
    }
    if (hasProperty(newValue, "y")) {
      const offsetY = newValue.y - oldValue.y;
      this.members.traverseForward((key: string, value: VerbalObject) => {
        value.silentlyUpdate("y", value.getAttr("y") + offsetY);
      });
    }
    if (hasProperty(newValue, "rotate")) {
      this.members.traverseForward((key: string, member: VerbalObject) => {
        member.silentlyUpdate("rotate", member.getRotate() + this.rotate);
        const finalCenterPoint = rotatePoint(
          member.getCenterPoint(),
          this.centerPoint,
          this.rotate,
          false
        );
        const finalMemberX = finalCenterPoint.x - member.getFinalWidth() / 2;
        const finalMemberY = finalCenterPoint.y - member.getFinalHeight() / 2;
        member.setFields({ x: finalMemberX, y: finalMemberY }, false);
      });
    }
  }

  protected _isPointInObject(point: Point): boolean {
    return isPointInPolygon(point, this.boundingBoxVertices);
  }

  protected _isPointInMember(point: Point): VerbalObject | null {
    let run = this.members.getEnd();
    while (!run.isNull()) {
      const obj = run.value();
      if (obj) {
        const res = obj.judgePointInObject(point);
        if (res) return res;
      }
      run.prev();
    }
    return null;
  }
}
