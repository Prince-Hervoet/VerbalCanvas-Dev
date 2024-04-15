/**
 * canvas封装类
 */
export class Canvas {
  private canvasDom: HTMLCanvasElement; // canvas dom引用
  private canvasContext: CanvasRenderingContext2D; // canvas上下文
  private width: number = 0; // canvas宽度
  private height: number = 0; // canvas高度
  private style: Record<string, string> = {}; // canvas元素的内联风格

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

  /**
   * 拼接style字符串
   * @param style
   * @returns
   */
  public static joinStyleStr(style: Record<string, string>): string {
    let ans = "";
    for (const key in style) {
      ans += `${key}: ${style[key]};`;
    }
    return ans;
  }

  /**
   * 获取canvas DOM
   * @returns
   */
  public getCanvasDom() {
    return this.canvasDom;
  }

  /**
   * 获取上下文
   * @returns
   */
  public getContext() {
    return this.canvasContext;
  }

  /**
   * 获取宽度
   * @returns
   */
  public getWidth() {
    return this.width;
  }

  /**
   * 获取高度
   * @returns
   */
  public getHeight() {
    return this.height;
  }

  /**
   * 设置宽度
   * @param width
   */
  public setWidth(width: number) {
    this.width = width;
    this.canvasDom.setAttribute("width", `${width}`);
  }

  /**
   * 设置高度
   * @param height
   */
  public setHeight(height: number) {
    this.height = height;
    this.canvasDom.setAttribute("height", `${height}`);
  }

  /**
   * 设置风格对象
   * @param style
   */
  public setStyle(style: Record<string, string>) {
    this.style = style;
    const styleStr = Canvas.joinStyleStr(style);
    this.canvasDom.setAttribute("style", styleStr);
  }
}
