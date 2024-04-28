import {
  Point,
  degreesToRadians,
  getGroupBoundingBox,
  isPointInPolygon,
  rotatePoint,
} from "../common/MathUtils";
import { BaseContainer, V_CONTAINER_TYPE } from "./BaseContainer";
import { VerbalObject } from "./VerbalObject";
import { Painter } from "./Painter";

export class Group extends BaseContainer {
  private members: Set<VerbalObject> = new Set(); // 存放成员的数据结构

  constructor() {
    super();
    this.containerType = V_CONTAINER_TYPE.GROUP;
  }

  /**
   * 更新和重置组的属性
   */
  private updateGroupFields() {
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
    this._updateBoundingBoxVertices();
  }

  /**
   * 将成员的坐标设置为相对于组
   */
  private updateMembersCoord() {
    for (const member of this.members) {
      member.silentlyUpdate("x", member.getAttr("x") - this.x);
      member.silentlyUpdate("y", member.getAttr("y") - this.y);
    }
  }

  /**
   * 重新计算成员的属性
   * @param obj
   */
  private recoverMemberCoord(obj: VerbalObject) {
    obj.silentlyUpdate("scaleX", obj.getAttr("scaleX") * this.scaleX);
    obj.silentlyUpdate("scaleY", obj.getAttr("scaleY") * this.scaleY);
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
    obj.silentlyUpdate("x", finalMemberX);
    obj.silentlyUpdate("y", finalMemberY);
    obj.silentlyUpdate("rotate", obj.getAttr("rotate") + this.rotate);
  }

  place(...objs: VerbalObject[]): void {
    for (const obj of objs) {
      if (!obj) continue;
      this.members.add(obj);
      obj.transfer(this);
    }
    this.updateGroupFields();
    this.updateMembersCoord();
  }

  remove(...objs: VerbalObject[]): void {
    let hasUpdate = false;
    for (const obj of objs) {
      if (!obj) continue;
      if (!this.contains(obj)) continue;
      this.recoverMemberCoord(obj);
      this.members.delete(obj);
      obj.transfer(null);
      hasUpdate = true;
    }
    if (!hasUpdate) return;
    for (const member of this.members) this.recoverMemberCoord(member);
    this.updateGroupFields();
    this.updateMembersCoord();
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
