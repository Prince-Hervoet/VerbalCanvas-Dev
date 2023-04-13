export class LessPriorityQueue {
  #content = [];
  #size;
  #compare;

  constructor(compare) {
    if (typeof compare !== "function") {
      throw "queue init error!";
    }
    this.#compare = compare;
  }

  isEmpty = () => {
    return this.#size === 0;
  };

  add = (data) => {
    this.#content.push(data);
    this.#size += 1;
    if (this.#size === 1) {
      return;
    }
    this.#heapUp(size - 1);
  };

  peek = () => {
    if (this.#size === 0) {
      return undefined;
    }
    return this.#content[0];
  };

  poll = () => {
    if (this.#size === 0) {
      return undefined;
    }
    const temp = this.#content[this.#size - 1];
    this.#content[this.#size - 1] = this.#content[0];
    this.#content[0] = temp;
    this.#content.pop();
    this.#size -= 1;
    this.#heapify(0);
  };

  #heapify = (index) => {
    if (index < 0 || index >= this.#size) {
      return;
    }
    let left = 2 * index + 1;
    let right = left + 1;
    let min = 0;
    let flag = left;
    while (left < this.#size) {
      min = this.#content[left];
      if (
        right < this.#size &&
        this.#compare(min, this.#content[right]) === 1
      ) {
        min = this.#content[right];
        flag = right;
      }
      if (this.#compare(this.#content[index], min) === 1) {
        const temp = this.#content[index];
        this.#content[index] = this.#content[flag];
        this.#content[flag] = temp;
        index = flag;
        left = 2 * index + 1;
        right = left + 1;
      } else {
        break;
      }
    }
  };

  #heapUp = (index) => {
    if (index <= 0 || index >= this.#size) {
      return;
    }
    let parent = Math.ceil((index - 1) / 2);
    while (parent > 0) {
      if (this.#compare(this.#content[index], this.#content[parent]) === -1) {
        const temp = this.#content[index];
        this.#content[index] = this.#content[parent];
        this.#content[parent] = temp;
        index = parent;
        parent = Math.ceil((index - 1) / 2);
      } else {
        break;
      }
    }
  };
}
