const canvasOne = document.getElementById("canvas_one") as HTMLCanvasElement;
const ctxOne = canvasOne.getContext("2d")!;
const btnCanvasOneDrawRect = document.getElementById("canvasOne_drawRect");
const btnCanvasOneDrawCircle = document.getElementById("canvasOne_drawCircle");
btnCanvasOneDrawRect?.addEventListener("click", () => {
  ctxOne.fillStyle = "green";
  ctxOne.fillRect(150, 150, 150, 100);
});
btnCanvasOneDrawCircle?.addEventListener("click", () => {
  ctxOne.fillStyle = "blue";
  ctxOne.beginPath();
  ctxOne.arc(300, 75, 50, 0, 2 * Math.PI);
  ctxOne.stroke();
  ctxOne.fill();
  ctxOne.closePath();
});
