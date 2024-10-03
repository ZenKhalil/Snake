class Node {
  constructor(data) {
    this.data = data;
    this.next = null;
  }
}

class Queue {
  constructor() {
    this.head = null; // Forreste element
    this.tail = null; // Bageste element
    this._size = 0; // Størrelse af køen
  }

  enqueue(data) {
    const newNode = new Node(data);
    if (this.tail) {
      this.tail.next = newNode;
    }
    this.tail = newNode;
    if (!this.head) {
      this.head = newNode;
    }
    this._size++;
  }

  dequeue() {
    if (!this.head) return null;
    const dequeuedData = this.head.data;
    this.head = this.head.next;
    if (!this.head) {
      this.tail = null;
    }
    this._size--;
    return dequeuedData;
  }

  peek() {
    return this.head ? this.head.data : null;
  }

  size() {
    return this._size;
  }

  get(index) {
    if (index < 0 || index >= this._size) return null;
    let current = this.head;
    let count = 0;
    while (count < index) {
      current = current.next;
      count++;
    }
    return current.data;
  }

  // Implementering af iterator for for-of loops
  [Symbol.iterator]() {
    let current = this.head;
    return {
      next: () => {
        if (current) {
          const value = current.data;
          current = current.next;
          return { value, done: false };
        } else {
          return { done: true };
        }
      },
    };
  }
}
