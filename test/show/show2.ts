import { SimpleEventType } from "../../src/core/EventMapping";
import {
  StaticVerbalCanvas,
  staticVerbalCanvas,
} from "../../src/core/StaticVerbalCanvas";
import { VerbalObject } from "../../src/core/VerbalObject";

const canvasTwo = document.getElementById("canvas_two") as HTMLCanvasElement;
const verbalCanvas = staticVerbalCanvas(canvasTwo, { width: 800, height: 500 });
verbalCanvas.startEvent();
const btnCanvasTwoDrawRect = document.getElementById("canvasTwo_drawRect");
const btnCanvasTwoDrawCircle = document.getElementById("canvasTwo_drawCircle");

let catching: VerbalObject | null = null;
let nOffsetX: number = 0;
let nOffsetY: number = 0;
verbalCanvas.eventOn("ve-mousedown", (event: SimpleEventType) => {
  const target = event.target;
  if (target && target.getObjectType() === "widget") {
    const { offsetX, offsetY } = event.hostMouseEvent!;
    nOffsetX = offsetX - target.getX();
    nOffsetY = offsetY - target.getY();
    catching = target;
  }
});

verbalCanvas.eventOn("ve-mousemove", (event: SimpleEventType) => {
  if (catching) {
    const { offsetX, offsetY } = event.hostMouseEvent!;
    catching.simplelyMoveCalFields(offsetX - nOffsetX, offsetY - nOffsetY);
  }
});

verbalCanvas.eventOn("ve-mouseup", (event: SimpleEventType) => {
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
    width: 100,
    height: 100,
    style: { fillStyle: "orange" },
  });
  verbalCanvas.place(rect);
});
btnCanvasTwoDrawCircle?.addEventListener("click", () => {
  const circle = StaticVerbalCanvas.Ellipse({
    x: 300,
    y: 300,
    width: 200,
    height: 200,
    style: { fillStyle: "blue" },
  });
  verbalCanvas.place(circle);
});
