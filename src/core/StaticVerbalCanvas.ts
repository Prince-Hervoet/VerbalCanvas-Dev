import { Ellipse } from "../widgets/Ellipse";
import { Line } from "../widgets/Line";
import { Picture } from "../widgets/Picture";
import { Polygon } from "../widgets/Polygon";
import { Rect } from "../widgets/Rect";
import { Canvas } from "./Canvas";
import {
  MouseEventFunctionType,
  bindEventMapping,
  unbindEventMapping,
} from "./EventMapping";
import { VerbalLayer } from "./VerbalLayer";
import { VerbalObject } from "./VerbalObject";

export const DEFAULT_WIDTH = 500;
export const DEFAULT_HEIGHT = 500;

export function staticVerbalCanvas(
  targetDom: HTMLCanvasElement,
  style: Record<string, any> = { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT }
) {
  const canvas = new Canvas(targetDom, style);
  const verbalLayer = new VerbalLayer(canvas);
  return new StaticVerbalCanvas(verbalLayer);
}

export class StaticVerbalCanvas {
  private verbalLayer: VerbalLayer;
  private eventMapping: Record<string, MouseEventFunctionType> | null = null;

  constructor(verbalLayer: VerbalLayer) {
    this.verbalLayer = verbalLayer;
  }

  getCanvasDom() {
    return this.verbalLayer.getCanvasDom();
  }

  getCanvasContext() {
    return this.verbalLayer.getCanvasContext();
  }

  generateImageUrl(x: number, y: number, width: number, height: number) {
    return this.verbalLayer.generateCanvasImageUrl(x, y, width, height);
  }

  place(...objs: VerbalObject[]) {
    this.verbalLayer.place(...objs);
  }

  placeArray(objs: VerbalObject[]) {
    this.verbalLayer.placeArray(objs);
  }

  remove(...objs: VerbalObject[]) {
    this.verbalLayer.remove(...objs);
  }

  contains(obj: VerbalObject): boolean {
    return this.verbalLayer.contains(obj);
  }

  size() {
    return this.verbalLayer.size();
  }

  startEvent() {
    if (this.eventMapping) return;
    this.eventMapping = bindEventMapping(this.verbalLayer);
  }

  stopEvent() {
    if (!this.eventMapping) return;
    unbindEventMapping(this.verbalLayer, this.eventMapping);
    this.eventMapping = null;
  }

  eventOn(name: string, handler: Function): void {
    this.verbalLayer.eventOn(name, handler);
  }

  eventOff(name: string, handler?: Function | undefined): void {
    this.verbalLayer.eventOff(name, handler);
  }

  eventRun(name: string, ...args: any[]): void {
    this.verbalLayer.eventRun(name, ...args);
  }

  static Rect(fields: Record<string, any> = {}) {
    return new Rect(fields);
  }

  static Ellipse(fields: Record<string, any> = {}) {
    return new Ellipse(fields);
  }

  static Polygon(fields: Record<string, any> = {}) {
    return new Polygon(fields);
  }

  static Picture(fields: Record<string, any> = {}) {
    return new Picture(fields);
  }

  static Line(fields: Record<string, any> = {}) {
    return new Line(fields);
  }
}
