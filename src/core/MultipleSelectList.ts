import { rotatePoint } from "../common/MathUtils";
import { hasProperty, isNullOrUndefined } from "../common/Utils";
import { V_CONTAINER_TYPE } from "./BaseContainer";
import { Group } from "./Group";
import { Painter } from "./Painter";
import { VerbalObject } from "./VerbalObject";

export class MultipleSelectList extends Group {
  constructor() {
    super();
    this.containerType = V_CONTAINER_TYPE.MULTIPLE_SELECT_LIST;
  }

  place(...objs: VerbalObject[]): void {
    this.placeArray(objs);
  }

  placeArray(objs: VerbalObject[]): void {
    for (const obj of objs) {
      if (
        isNullOrUndefined(obj) ||
        this.contains(obj) ||
        obj === this ||
        obj.getAttr("containerType") === V_CONTAINER_TYPE.MULTIPLE_SELECT_LIST
      )
        continue;
      this.members.add(obj);
    }
    // for (const member of this.members) this._recoverMemberCoord(member);
    this._updateGroupFields();
    // this._updateMembersCoord();
  }

  remove(...objs: VerbalObject[]): void {
    let hasUpdate = false;
    for (const obj of objs) {
      if (!obj) continue;
      if (!this.contains(obj)) continue;
      this._recoverMemberCoord(obj);
      this.members.delete(obj);
      hasUpdate = true;
    }
    if (!hasUpdate) return;
    for (const member of this.members) this._recoverMemberCoord(member);
    this._updateGroupFields();
    // this._updateMembersCoord();
  }

  protected _render(painter: Painter): void {}

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
      for (const member of this.members)
        member.silentlyUpdate("x", member.getAttr("x") + offsetX);
    }
    if (hasProperty(newValue, "y")) {
      const offsetY = newValue.y - oldValue.y;
      for (const member of this.members)
        member.silentlyUpdate("y", member.getAttr("y") + offsetY);
    }
    if (hasProperty(newValue, "rotate")) {
      for (const member of this.members) {
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
      }
    }
  }
}
