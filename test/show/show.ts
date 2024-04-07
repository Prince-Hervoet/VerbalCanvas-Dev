import { ISimpleEvent } from "../../src/core/EventMapping";
import {
  StaticVerbalCanvas,
  staticVerbalCanvas,
} from "../../src/core/StaticVerbalCanvas";
import { VerbalObject } from "../../src/core/VerbalObject";

const canvasOne = document.getElementById("canvas_one") as HTMLCanvasElement;
const ctxOne = canvasOne.getContext("2d")!;
const btnCanvasOneDrawRect = document.getElementById("canvasOne_drawRect");
const btnCanvasOneDrawCircle = document.getElementById("canvasOne_drawCircle");
btnCanvasOneDrawRect?.addEventListener("click", () => {
  ctxOne.fillStyle = "green";
  ctxOne.fillRect(100, 100, 150, 100);
});
btnCanvasOneDrawCircle?.addEventListener("click", () => {
  ctxOne.fillStyle = "blue";
  ctxOne.beginPath();
  ctxOne.arc(300, 75, 50, 0, 2 * Math.PI);
  ctxOne.stroke();
  ctxOne.fill();
  ctxOne.closePath();
});

const canvasTwo = document.getElementById("canvas_two") as HTMLCanvasElement;
const verbalCanvas = staticVerbalCanvas(canvasTwo, { width: 800, height: 400 });
verbalCanvas.startEvent();
const btnCanvasTwoDrawRect = document.getElementById("canvasTwo_drawRect");
const btnCanvasTwoDrawCircle = document.getElementById("canvasTwo_drawCircle");

let catching: VerbalObject | null = null;
let nOffsetX: number = 0;
let nOffsetY: number = 0;
verbalCanvas.eventOn("ve-mousedown", (event: ISimpleEvent) => {
  const target = event.target;
  if (target && target.getObjectType() === "widget") {
    const { offsetX, offsetY } = event.hostMouseEvent!;
    nOffsetX = offsetX - target.getX();
    nOffsetY = offsetY - target.getY();
    catching = target;
  }
});

verbalCanvas.eventOn("ve-mousemove", (event: ISimpleEvent) => {
  if (catching) {
    const { offsetX, offsetY } = event.hostMouseEvent!;
    catching.simplelyMoveCalFields(offsetX - nOffsetX, offsetY - nOffsetY);
  }
});

verbalCanvas.eventOn("ve-mouseup", (event: ISimpleEvent) => {
  if (catching) {
    const { offsetX, offsetY } = event.hostMouseEvent!;
    catching.setFields({ x: offsetX - nOffsetX, y: offsetY - nOffsetY }, true);
    catching = null;
  }
});

btnCanvasTwoDrawRect?.addEventListener("click", () => {
  const rect = StaticVerbalCanvas.Rect({
    x: 100,
    y: 100,
    width: 200,
    height: 200,
    style: { fillStyle: "orange" },
  });
  verbalCanvas.place(rect);
});
btnCanvasTwoDrawCircle?.addEventListener("click", () => {
  ctxOne.fillStyle = "blue";
  ctxOne.beginPath();
  ctxOne.arc(300, 75, 50, 0, 2 * Math.PI);
  ctxOne.stroke();
  ctxOne.fill();
  ctxOne.closePath();
});
