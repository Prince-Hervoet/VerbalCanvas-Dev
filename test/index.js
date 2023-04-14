import { LessPriorityQueue } from "../src/service/lessPriorityQueue.js";

const queue = new LessPriorityQueue((a, b) => {
  if (a.updateAt > b.updateAt) {
    return 1;
  } else if (a.updateAt < b.updateAt) {
    return -1;
  } else {
    return 0;
  }
});

queue.add({
  updateAt: 111,
  val: 222,
});

queue.add({
  updateAt: 222,
  val: 123,
});

queue.add({
  updateAt: 333,
  val: 333,
});

queue.add({
  updateAt: 444,
  val: 6675,
});

// console.log(queue.#content);
// queue.poll();
// console.log(queue.#content);
// queue.poll();
// console.log(queue.#content);
// queue.poll();
// console.log(queue.#content);
// queue.poll();
// console.log(queue.#content);
// console.log(queue.poll());
// console.log(queue.poll());

// while (!queue.isEmpty()) {
//   console.log(queue.poll());
// }
