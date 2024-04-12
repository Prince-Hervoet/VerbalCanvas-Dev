import { SimpleEventType } from "../../src/core/EventMapping";
import {
  StaticVerbalCanvas,
  staticVerbalCanvas,
} from "../../src/core/StaticVerbalCanvas";
import { Text } from "../../src/widgets/Text";
import { Transformer } from "../../src/widgets/default/Transformer";

const canvasFour = document.getElementById("canvas_four") as HTMLCanvasElement;
const verbalCanvas = staticVerbalCanvas(canvasFour, {
  width: 800,
  height: 500,
});
verbalCanvas.startEvent();
const btnCanvasFourDrawRect = document.getElementById("canvasFour_drawRect");
const btnCanvasFourDrawCircle = document.getElementById(
  "canvasFour_drawCircle"
);

btnCanvasFourDrawRect?.addEventListener("click", () => {
  const rect = StaticVerbalCanvas.Rect({
    x: 100,
    y: 100,
    width: 100,
    height: 100,
    style: { fillStyle: "orange" },
  });
  rect.eventOn("ve-mouseover", (event: SimpleEventType) => {
    const style = rect.getStyle();
    style.fillStyle = "red";
    rect.update("style", style);
    console.log("鼠标放上去了");
  });
  rect.eventOn("ve-mouseout", (event: SimpleEventType) => {
    const style = rect.getStyle();
    style.fillStyle = "#2E8B57";
    rect.update("style", style);
  });
  verbalCanvas.place(rect);
});
btnCanvasFourDrawCircle?.addEventListener("click", () => {
  const circle = StaticVerbalCanvas.Ellipse({
    x: 300,
    y: 300,
    width: 200,
    height: 200,
    style: { fillStyle: "blue" },
  });
  verbalCanvas.place(circle);
});
