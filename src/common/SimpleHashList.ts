export interface ObjectList<K, V> {
  insertFirst(key: K, value: V): void;
}

/**
 * 链表节点
 */
class SimpleListNode<K, V> {
  public key: K;
  public value: V;
  public next: SimpleListNode<K, V> | null = null;
  public prev: SimpleListNode<K, V> | null = null;

  constructor(key: K, value: V) {
    this.key = key;
    this.value = value;
  }

  public getKey() {
    return this.key;
  }

  public getValue() {
    return this.value;
  }

  public getNext() {
    return this.next;
  }

  public getPrev() {
    return this.prev;
  }
}

/**
 * 键值对结构
 */
export class SimpleHashListEntry<K, V> {
  public key: K;
  public value: V;

  constructor(key: K, value: V) {
    this.key = key;
    this.value = value;
  }
}

/**
 * 迭代器
 */
export class SimpleHashListIterator<K, V> {
  private node: SimpleListNode<K, V> | null = null;

  constructor(node: SimpleListNode<K, V> | null) {
    this.node = node;
  }

  public isNull() {
    return this.node === null;
  }

  public key() {
    if (!this.node) return undefined;
    return this.node.key;
  }

  public value() {
    if (!this.node) return undefined;
    return this.node.value;
  }

  public next() {
    if (!this.node) return;
    this.node = this.node.next;
  }

  public prev() {
    if (!this.node) return;
    this.node = this.node.prev;
  }
}

/**
 * 哈希链表
 */
export class SimpleHashList<K, V> {
  private head: SimpleListNode<K, V> | null = null;
  private tail: SimpleListNode<K, V> | null = null;
  private keyToNode: Map<K, SimpleListNode<K, V>> = new Map();

  /**
   * 在头部插入
   * @param key
   * @param value
   * @returns
   */
  public insertFirst(key: K, value: V) {
    let nNode = this.keyToNode.get(key);
    if (nNode) return false;
    nNode = new SimpleListNode(key, value);
    if (this.keyToNode.size === 0) {
      this.head = nNode;
      this.tail = nNode;
      this.keyToNode.set(key, nNode);
      return true;
    }
    nNode.next = this.head;
    this.head!.prev = nNode;
    this.head = nNode;
    this.keyToNode.set(key, nNode);
    return true;
  }

  /**
   * 在尾部插入
   * @param key
   * @param value
   * @returns
   */
  public insertLast(key: K, value: V) {
    let nNode = this.keyToNode.get(key);
    if (nNode) return false;
    nNode = new SimpleListNode(key, value);
    if (this.keyToNode.size === 0) {
      this.head = nNode;
      this.tail = nNode;
      this.keyToNode.set(key, nNode);
      return true;
    }
    nNode.prev = this.tail;
    this.tail!.next = nNode;
    this.tail = nNode;
    this.keyToNode.set(key, nNode);
    return true;
  }

  /**
   * 在中间插入
   * @param key
   * @param value
   * @param index
   * @returns
   */
  public insertAt(key: K, value: V, index: number) {
    if (index < 0 || index > this.keyToNode.size) return;
    if (this.keyToNode.has(key)) return;
    if (index === 0) {
      return this.insertFirst(key, value);
    } else if (index === this.keyToNode.size) {
      return this.insertLast(key, value);
    }
    let flag = this.head;
    for (let i = 0; i < index - 1; ++i) {
      flag = flag!.getNext();
    }
    if (!flag) return false;
    const prevNode = flag;
    const nextNode = flag.getNext();
    const nNode = new SimpleListNode(key, value);
    prevNode.next = nNode;
    nNode.prev = prevNode;
    nNode.next = nextNode;
    nextNode!.prev = nNode;
    this.keyToNode.set(key, nNode);
    return true;
  }

  /**
   * 移除某个key
   * @param key
   * @returns
   */
  public remove(key: K) {
    const node = this.keyToNode.get(key);
    if (!node) return false;
    if (this.keyToNode.size === 1) {
      this.head = null;
      this.tail = null;
      this.keyToNode.delete(key);
      return true;
    }
    if (node === this.head) {
      const temp = node.next;
      node.next = null;
      node.prev = null;
      this.head = temp;
      temp!.prev = null;
      this.keyToNode.delete(key);
      return true;
    }
    if (node === this.tail) {
      const temp = node.prev;
      node.next = null;
      node.prev = null;
      this.tail = temp;
      temp!.next = null;
      this.keyToNode.delete(key);
      return true;
    }
    const prevNode = node.prev!;
    const nextNode = node.next!;
    prevNode.next = nextNode;
    nextNode.prev = prevNode;
    this.keyToNode.delete(key);
    return true;
  }

  /**
   * 获取头部引用
   * @returns
   */
  public getHead() {
    return this.head;
  }

  /**
   * 获取尾部引用
   * @returns
   */
  public getTail() {
    return this.tail;
  }

  public getBegin() {
    return new SimpleHashListIterator<K, V>(this.head);
  }

  public getEnd() {
    return new SimpleHashListIterator<K, V>(this.tail);
  }

  /**
   * 获取数量
   * @returns
   */
  public getSize() {
    return this.keyToNode.size;
  }

  /**
   * 清空集合
   */
  public clear() {
    this.head = null;
    this.tail = null;
    this.keyToNode.clear();
  }

  /**
   * 判断是否包含某个key
   * @param key
   * @returns
   */
  public contains(key: K): boolean {
    return this.keyToNode.has(key);
  }

  /**
   * 获取数据数组
   * @returns
   */
  public getEntryArray() {
    if (this.getSize() === 0) return [];
    let run = this.head;
    const ans = [];
    while (run) {
      ans.push(new SimpleHashListEntry<K, V>(run.key, run.value));
      run = run.getNext();
    }
    return ans;
  }

  /**
   * 正向遍历数据
   * @param callback
   * @returns
   */
  public traverseForward(callback: (key: K, value: V) => void) {
    if (this.keyToNode.size === 0) return;
    let run = this.head;
    while (run) {
      callback(run.key, run.value);
      run = run.next;
    }
  }

  /**
   * 反向遍历数据
   * @param callback
   * @returns
   */
  public traverseBackward(callback: (key: K, value: V) => void) {
    if (this.keyToNode.size === 0) return;
    let run = this.tail;
    while (run) {
      callback(run.key, run.value);
      run = run.prev;
    }
  }
}
