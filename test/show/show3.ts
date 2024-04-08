import { SimpleEventType } from "../../src/core/EventMapping";
import {
  StaticVerbalCanvas,
  staticVerbalCanvas,
} from "../../src/core/StaticVerbalCanvas";
import { VerbalObject } from "../../src/core/VerbalObject";
import { Polygon } from "../../src/widgets/Polygon";
import { Text } from "../../src/widgets/Text";
import { Transformer } from "../../src/widgets/default/Transformer";

const canvasTwo = document.getElementById("canvas_three") as HTMLCanvasElement;
const verbalCanvas = staticVerbalCanvas(canvasTwo, { width: 800, height: 500 });
verbalCanvas.startEvent();
const btnCanvasThreeDrawRect = document.getElementById("canvasThree_drawRect");
const btnCanvasThreeDrawCircle = document.getElementById(
  "canvasThree_drawCircle"
);

let index = -1;
const transformer = new Transformer();
verbalCanvas.eventOn("ve-mousedown", (event: SimpleEventType) => {
  const target = event.target;
  if (target && target.getObjectType() === "widget") {
    if (target.getAttr("widgetType") === "transformer" && index === -1) {
      const { offsetX, offsetY } = event.hostMouseEvent!;
      index = (target as Transformer).pointOnControlPointIndex({
        x: offsetX,
        y: offsetY,
      });
      console.log(index);
    } else {
      transformer.linkTo(target);
      verbalCanvas.place(transformer);
      setTimeout(() => {
        transformer.transformTarget({ x: 50, y: 60 }, 5);
      }, 2000);
    }
  } else {
    verbalCanvas.remove(transformer);
  }
});

verbalCanvas.eventOn("ve-mousemove", (event: SimpleEventType) => {
  if (index !== -1) {
    // debugger;
    const { offsetX, offsetY } = event.hostMouseEvent!;
    transformer.transformTarget({ x: offsetX, y: offsetY }, index);
  }
});

verbalCanvas.eventOn("ve-mouseup", (event: SimpleEventType) => {
  index = -1;
});

btnCanvasThreeDrawRect?.addEventListener("click", () => {
  const rect = StaticVerbalCanvas.Rect({
    x: 100,
    y: 100,
    width: 100,
    height: 100,
    style: { fillStyle: "orange" },
  });
  const ply = new Text({
    x: 250,
    y: 200,
    text: "Hello World",
    maxWidth: -1,
    style: { fillStyle: "orange", font: "48px serif" },
  });
  verbalCanvas.place(ply);
});
btnCanvasThreeDrawCircle?.addEventListener("click", () => {
  const circle = StaticVerbalCanvas.Ellipse({
    x: 300,
    y: 300,
    width: 200,
    height: 200,
    style: { fillStyle: "blue" },
  });
  verbalCanvas.place(circle);
});
