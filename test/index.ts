import { parseSvgPath } from "../src/common/Utils";
import { SimpleEventType } from "../src/core/EventMapping";
import { Group } from "../src/core/Group";
import {
  StaticVerbalCanvas,
  staticVerbalCanvas,
} from "../src/core/StaticVerbalCanvas";
import { Picture } from "../src/widgets/Picture";
import { Text } from "../src/widgets/Text";
import { Transformer } from "../src/widgets/default/Transformer";

const container = document.getElementById("main")!;
const canvasDom = document.getElementById("canvas")! as HTMLCanvasElement;

const svc = staticVerbalCanvas(canvasDom, {
  width: 1000,
  height: 1000,
  style: {
    "background-color": "#FFF8DC",
  },
});
const rect = StaticVerbalCanvas.Rect({
  x: 100,
  y: 100,
  width: 200,
  height: 200,
  style: {
    fillStyle: "#2E8B57",
  },
});

const ellipse = StaticVerbalCanvas.Ellipse({
  x: 200,
  y: 200,
  width: 200,
  height: 200,
  style: {
    fillStyle: "#FFA500",
  },
});

const poly = StaticVerbalCanvas.Polygon({
  vertices: [
    { x: 300, y: 300 },
    { x: 200, y: 300 },
    { x: 250, y: 400 },
  ],
  style: {
    fillStyle: "#DC143C",
  },
});

const pic = new Picture({
  x: 200,
  y: 200,
  width: 400,
  height: 200,
  src: "https://cdn.pixabay.com/photo/2024/02/14/13/13/hamburg-8573427_960_720.jpg",
});

const text = new Text({
  x: 100,
  y: 100,
  text: "Hello World!",
  style: {
    fillStyle: "blue",
    font: "40px Arial",
  },
});

const transformer = new Transformer({});
transformer.linkTo(rect);
svc.place(rect, transformer);
svc.startEvent();
svc.eventOn("ve-mouseover", (event: SimpleEventType) => {
  console.log(event);
});

// rect.eventOn("ve-mouseover", (event: SimpleEventType) => {
//   const style = rect.getStyle();
//   style.fillStyle = "red";
//   rect.update("style", style);
// });

// rect.eventOn("ve-mouseout", (event: SimpleEventType) => {
//   const style = rect.getStyle();
//   style.fillStyle = "#2E8B57";
//   rect.update("style", style);
// });

setTimeout(() => {
  // debugger;
  // rect.update("rotate", 45);
  // rect.update("scaleX", 1.3);
  // transformer.update("rotate", 45);
  // transformer.transformTarget({ x: 270, y: 90 }, 4);
  // console.log(text);
  // console.log(transformer);
  // transformer.transformTarget({ x: 300, y: 90 }, 5);
  // console.log(text);
  // console.log(transformer);
  // transformer.transformTarget({ x: 350, y: 90 }, 5);
  // console.log(text);
  // console.log(transformer);
}, 2000);
