import { UNKNOWN_STR } from "../../common/Utils";

/**
 * 动画执行的函数
 * timestamp 执行当前帧的时间戳
 * duration 动画已持续时间
 */
export type AnimationFuncType = (timestamp: number, duration: number) => void;

export class Animation {
  private animationName: string = UNKNOWN_STR; // 动画名称
  private animationAction: AnimationFuncType; // 动画执行的函数
  private isStarted: boolean = false; // 动画是否开始的标志
  private startTimestamp: number = -1; // 动画开始执行的时间戳

  constructor(animationAction: AnimationFuncType) {
    this.animationAction = animationAction;
  }

  setAnimationAction(animationAction: AnimationFuncType) {
    this.animationAction = animationAction;
  }

  setAnimationName(animationName: string) {
    this.animationName = animationName;
  }

  /**
   * 开始动画
   * @returns
   */
  startAnimation() {
    if (this.isStarted) return;
    this.isStarted = true;
    const frameAction = (timestamp: number) => {
      if (!this.isStarted) return;
      this.animationAction(timestamp, timestamp - this.startTimestamp);
      window.requestAnimationFrame(frameAction);
    };
    this.startTimestamp = Date.now();
    window.requestAnimationFrame(frameAction);
  }

  /**
   * 结束动画
   */
  stopAnimation() {
    this.startTimestamp = -1;
    this.isStarted = false;
  }

  /**
   * 获取动画开始的时间戳
   * @returns
   */
  getStartTimestamp() {
    return this.startTimestamp;
  }

  /**
   * 获取动画名称
   * @returns
   */
  getAnimationName() {
    return this.animationName;
  }
}
