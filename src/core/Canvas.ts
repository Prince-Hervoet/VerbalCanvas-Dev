export class Canvas {
  private canvasDom: HTMLCanvasElement;
  private canvasContext: CanvasRenderingContext2D;
  private width: number = 0;
  private height: number = 0;
  private style: Record<string, string> = {};

  constructor(
    canvasDom: HTMLCanvasElement,
    fields: Record<string, any> = { width: 500, height: 500 }
  ) {
    this.canvasDom = canvasDom;
    this.canvasContext = canvasDom.getContext("2d")!;
    this.width = fields.width ?? 500;
    this.height = fields.height ?? 500;
    this.style = fields.style ?? {};
    this.setWidth(this.width);
    this.setHeight(this.height);
    this.setStyle(this.style);
  }

  public static joinStyleStr(style: Record<string, string>): string {
    let ans = "";
    for (const key in style) {
      ans += `${key}: ${style[key]};`;
    }
    return ans;
  }

  public getCanvasDom() {
    return this.canvasDom;
  }

  public getContext() {
    return this.canvasContext;
  }

  public getWidth() {
    return this.width;
  }

  public getHeight() {
    return this.height;
  }

  public setWidth(width: number) {
    this.width = width;
    this.canvasDom.setAttribute("width", `${width}`);
  }

  public setHeight(height: number) {
    this.height = height;
    this.canvasDom.setAttribute("height", `${height}`);
  }

  public setStyle(style: Record<string, string>) {
    this.style = style;
    const styleStr = Canvas.joinStyleStr(style);
    this.canvasDom.setAttribute("style", styleStr);
  }
}
