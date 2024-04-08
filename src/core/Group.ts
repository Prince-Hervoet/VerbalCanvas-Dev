import {
  Point,
  degreesToRadians,
  getGroupBoundingBox,
  isPointInPolygon,
} from "../common/MathUtils";
import { BaseContainer, V_CONTAINER_TYPE } from "./BaseContainer";
import { VerbalObject } from "./VerbalObject";
import { IPainter } from "./Painter";

export class Group extends BaseContainer {
  private members: Set<VerbalObject> = new Set();

  constructor() {
    super();
    this.containerType = V_CONTAINER_TYPE.GROUP;
  }

  private updateGroupFields() {
    const bbs: Point[][] = [];
    for (const member of this.members)
      bbs.push(member.getBoundingBoxVertices());
    const { minX, minY, maxX, maxY } = getGroupBoundingBox(bbs);
    this.x = minX;
    this.y = minY;
    this.width = maxX - minX;
    this.height = maxY - minY;
    this._updateCenterPoint();
    this._updateBoundingBoxVertices();
  }

  private updateMembersCoord() {
    for (const member of this.members) {
      member.setAttr("x", member.getAttr("x") - this.x);
      member.setAttr("y", member.getAttr("y") - this.y);
    }
  }

  private recoverMemberCoord(obj: VerbalObject) {
    const groupRotateRad = degreesToRadians(this.rotate);
    const mathSin = Math.sin(groupRotateRad);
    const mathCos = Math.cos(groupRotateRad);
    const rotateX = mathCos * obj.getAttr("x") - mathSin * obj.getAttr("y");
    const rotateY = mathCos * obj.getAttr("y") + mathSin * obj.getAttr("x");
    obj.setAttr("rotate", obj.getAttr("rotate") + this.rotate);
    obj.setAttr("scaleX", obj.getAttr("scaleX") * this.scaleX);
    obj.setAttr("scaleY", obj.getAttr("scaleY") * this.scaleY);
    obj.setAttr("x", this.x + rotateX);
    obj.setAttr("y", this.y + rotateY);
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
    for (const obj of objs) {
      if (!obj) continue;
      if (!this.contains(obj)) continue;
      this.recoverMemberCoord(obj);
      this.members.delete(obj);
      obj.transfer(null);
    }
    this.updateGroupFields();
    this.updateMembersCoord();
  }

  contains(obj: VerbalObject): boolean {
    return this.members.has(obj);
  }

  getMembers(): VerbalObject[] {
    const ans = [];
    for (const member of this.members) ans.push(member);
    return ans;
  }

  protected _render(painter: IPainter): void {
    for (const member of this.members) {
      if (painter.draw(member)) continue;
      member.render(painter);
    }
  }

  public isPointInObject(point: Point): boolean {
    return isPointInPolygon(point, this.boundingBoxVertices);
  }
}
