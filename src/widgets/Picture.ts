import { Point, isPointInPolygon } from "../common/MathUtils";
import { setAttrIfExist } from "../common/Utils";
import { BaseWidget } from "../core/BaseWidget";
import { IPainter } from "../core/Painter";

export class Picture extends BaseWidget {
  private src: string = "";
  private imageCache: HTMLImageElement | null = null;

  constructor(fields: Record<string, any>) {
    super(fields);
    setAttrIfExist(this, "src", fields.src, "");
    this.widgetType = "picture";
  }

  public static solveSvgStr(svgStr: string): string {
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgStr);
  }

  protected _render(painter: IPainter): void {
    const ctx = painter.getContext();
    if (this.imageCache) {
      ctx.drawImage(this.imageCache, 0, 0, this.width, this.height);
    } else {
      this.imageCache = new Image();
      this.imageCache.src = this.src;
      this.imageCache.onload = () => {
        this.render(painter);
      };
    }
  }

  protected _update(
    newValue: Record<string, any>,
    oldValue: Record<string, any>
  ): void {
    if (newValue.hasOwn("src")) this.imageCache = null;
  }

  public isPointInObject(point: Point): boolean {
    return isPointInPolygon(point, this.boundingBoxVertices);
  }
}
