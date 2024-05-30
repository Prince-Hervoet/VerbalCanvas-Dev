import {
  Point,
  getGroupBoundingBox,
  isPointInPolygon,
  rotatePoint,
} from "../common/MathUtils";
import { BaseContainer, V_CONTAINER_TYPE } from "./BaseContainer";
import { VerbalObject } from "./VerbalObject";
import { Painter } from "./Painter";
import { isNullOrUndefined } from "../common/Utils";
import { ShlType, SimpleHashList } from "../common/SimpleHashList";

/**
 * TODO: 将members替换掉，处理深层的鼠标响应
 * 组类
 */
export class Group extends BaseContainer {
  protected objectList: ShlType<string, VerbalObject> = new SimpleHashList();
  protected members: Set<VerbalObject> = new Set(); // 存放成员的数据结构
  protected tempCenterPoint: Point = { x: 0, y: 0 };

  constructor() {
    super();
    this.containerType = V_CONTAINER_TYPE.GROUP;
  }

  /**
   * 更新和重置组的属性
   */
  protected _updateGroupFields() {
    const bbs: Point[][] = [];
    for (const member of this.members)
      bbs.push(member.getBoundingBoxVertices());
    const { minX, minY, maxX, maxY } = getGroupBoundingBox(bbs);
    this.x = minX;
    this.y = minY;
    this.width = maxX - minX;
    this.height = maxY - minY;
    this.rotate = 0;
    this._updateCenterPoint();
    this._updateTempCenterPoint();
    this._updateBoundingBoxVertices();
  }

  /**
   * 将成员的坐标设置为相对于组
   */
  protected _updateMembersCoord() {
    for (const member of this.members) {
      member.silentlyUpdate("x", member.getAttr("x") - this.x);
      member.silentlyUpdate("y", member.getAttr("y") - this.y);
    }
  }

  protected _updateTempCenterPoint() {
    this.tempCenterPoint.x = this.centerPoint.x - this.x;
    this.tempCenterPoint.y = this.centerPoint.y - this.y;
  }

  /**
   * 重新计算成员的属性
   * @param obj
   */
  protected _recoverMemberCoord(obj: VerbalObject) {
    const finalScaleX = obj.getAttr("scaleX") * this.scaleX;
    const finalScaleY = obj.getAttr("scaleY") * this.scaleY;
    const finalRotate = obj.getAttr("rotate") + this.rotate;
    obj.setFields(
      { scaleX: finalScaleX, scaleY: finalScaleY, rotate: finalRotate },
      false
    );
    const finalCenterPoint = rotatePoint(
      obj.getCenterPoint(),
      {
        x: this.centerPoint.x - this.x,
        y: this.centerPoint.y - this.y,
      },
      this.rotate,
      false
    );
    const finalMemberX = this.x + finalCenterPoint.x - obj.getFinalWidth() / 2;
    const finalMemberY = this.y + finalCenterPoint.y - obj.getFinalHeight() / 2;
    obj.setFields({ x: finalMemberX, y: finalMemberY }, false);
  }

  place(...objs: VerbalObject[]): void {
    this.placeArray(objs);
  }

  placeArray(objs: VerbalObject[]): void {
    const coincident = [];
    for (const obj of objs) {
      if (
        isNullOrUndefined(obj) ||
        this.contains(obj) ||
        obj === this ||
        obj.getAttr("containerType") === V_CONTAINER_TYPE.MULTIPLE_SELECT_LIST
      )
        continue;
      coincident.push(obj);
    }
    if (coincident.length === 0) return;
    for (const member of this.members) this._recoverMemberCoord(member);
    for (const obj of coincident) {
      obj.transfer(this);
      this.objectList.insertLast(obj.getObjectId(), obj);
      this.members.add(obj);
    }
    this._updateGroupFields();
    this._updateMembersCoord();
    this.requestUpdate();
  }

  /**
   * 删除成员
   * @param objs
   * @returns
   */
  remove(...objs: VerbalObject[]): void {
    let hasUpdate = false;
    for (const obj of objs) {
      if (!obj) continue;
      if (!this.contains(obj)) continue;
      this._recoverMemberCoord(obj);
      this.objectList.remove(obj.getObjectId());
      this.members.delete(obj);
      obj.transfer(null);
      hasUpdate = true;
    }
    if (!hasUpdate) return;
    for (const member of this.members) this._recoverMemberCoord(member);
    this._updateGroupFields();
    this._updateMembersCoord();
    this.requestUpdate();
  }

  clear(): void {
    for (const member of this.members) this._recoverMemberCoord(member);
    this.members.clear();
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.rotate = 0;
    this.requestUpdate();
  }

  contains(obj: VerbalObject): boolean {
    return this.members.has(obj);
  }

  getMembers(): VerbalObject[] {
    const ans = [];
    for (const member of this.members) ans.push(member);
    return ans;
  }

  protected _update(
    newValue: Record<string, any>,
    oldValue: Record<string, any>
  ): void {
    this._updateTempCenterPoint();
  }

  protected _render(painter: Painter): void {
    for (const member of this.members) {
      if (painter.draw(member)) continue;
      member.render(painter);
    }
  }

  public isPointInObject(point: Point): boolean {
    return isPointInPolygon(point, this.boundingBoxVertices);
  }
}
