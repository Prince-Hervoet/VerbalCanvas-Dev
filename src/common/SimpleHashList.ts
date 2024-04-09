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
 * 哈希链表
 */
export class SimpleHashList<K, V> {
  private head: SimpleListNode<K, V> | null = null;
  private tail: SimpleListNode<K, V> | null = null;
  private keyToNode: Map<K, SimpleListNode<K, V>> = new Map();

  public contains(key: K) {
    return this.keyToNode.has(key);
  }

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

  public getHead() {
    return this.head;
  }

  public getTail() {
    return this.tail;
  }

  public getSize() {
    return this.keyToNode.size;
  }

  public clear() {
    this.head = null;
    this.tail = null;
    this.keyToNode.clear();
  }

  public getArray() {
    if (this.getSize() === 0) return [];
    let flag = this.head;
    const ans = [];
    while (flag) {
      ans.push({ key: flag.getKey(), value: flag.getValue() });
      flag = flag.getNext();
    }
    return ans;
  }
}
