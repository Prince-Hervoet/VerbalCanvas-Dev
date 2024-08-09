import { SimpleEventType } from "../src/core/EventMapping";
import {
  StaticVerbalCanvas,
  staticVerbalCanvas,
} from "../src/core/StaticVerbalCanvas";
import { Picture } from "../src/widgets/Picture";
import { Text } from "../src/widgets/Text";
import { Transformer } from "../src/widgets/default/Transformer";
import { Line } from "../src/widgets/Line";
import { Animation } from "../src/widgets/default/Animation";
import { Combination } from "../src/core/Combination";

const container = document.getElementById("main")!;
const canvasDom = document.getElementById("canvas")! as HTMLCanvasElement;

canvasDom.addEventListener("click", (event: MouseEvent) => {
  console.log(event);
});

const svc = staticVerbalCanvas(canvasDom, {
  width: 1000,
  height: 1000,
  style: {
    "background-color": "#FFF8DC",
  },
});
const rect = StaticVerbalCanvas.Rect({
  x: 200,
  y: 100,
  width: 200,
  height: 200,
  isFixedLineWidth: true,
  style: {
    fillStyle: "#2E8B57",
    strokeStyle: "blue",
    lineWidth: 50,
  },
});

const rect2 = StaticVerbalCanvas.Rect({
  x: 300,
  y: 300,
  width: 200,
  height: 200,
  isFixedLineWidth: true,
  style: {
    fillStyle: "#eccc68",
    strokeStyle: "green",
    lineWidth: 6,
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
// transformer.linkTo(rect);
// const ans = [];
// for (let i = 0; i < 100000; ++i) {
//   ans.push(
//     StaticVerbalCanvas.Rect({
//       x: generateRandomNumber(20, 600),
//       y: generateRandomNumber(20, 600),
//       width: 100,
//       height: 100,
//       style: {
//         fillStyle: generateRandomHexColor(),
//       },
//     })
//   );
// // }
const group = new Combination();
group.place(rect, ellipse, rect2);
// transformer.linkTo(group);
// const line = new Line({
//   x1: 100,
//   y1: 100,
//   x2: 200,
//   y2: 300,
//   style: { strokeStyle: "green", lineWidth: 10 },
// });

const period = 2000;

const animation = new Animation((timestamp: number, duration: number) => {
  rect.update("x", 60 * Math.sin((timestamp * 2 * Math.PI) / period) + 100);
});

svc.place(rect);
svc.startEvent();

rect.eventOn("ve-mouseup", (event: SimpleEventType) => {
  console.log(event);
});
// animation.startAnimation();
// const testMultipleSelectList = new MultipleSelectList();
// svc.place(testMultipleSelectList);
// testMultipleSelectList.place(rect, rect2);

// console.log(testMultipleSelectList);

// const startTime = Date.now();
// const endTime = Date.now();
// console.log("耗时: " + (endTime - startTime));
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
  // testMultipleSelectList.update("rotate", 50);
}, 1500);
