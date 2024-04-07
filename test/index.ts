import { parseSvgPath } from "../src/common/Utils";
import { ISimpleEvent } from "../src/core/EventMapping";
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
  maxWidth: -1,
  style: {
    font: "40px Arial",
  },
});

const transformer = new Transformer({});

console.log(text);
transformer.linkTo(rect);
svc.place(rect, transformer);
svc.startEvent();
svc.eventOn("ve-mousedown", (event: ISimpleEvent) => {
  console.log(event);
});

setTimeout(() => {
  transformer.transformTarget({ x: 400, y: 107 }, 6);
}, 2000);
