import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TreeService {
  root: any;

  constructor(@Inject('key') key: any,@Inject('value') value = key) {
    this.root = new TreeNode(key, value);
   }

   *preOrderTraversal(node = this.root) {
    yield node;
    if (node.children.length) {
      for (let child of node.children) {
        yield* this.preOrderTraversal(child);
      }
    }
  }

  *postOrderTraversal(node = this.root) {
    if (node.children.length) {
      for (let child of node.children) {
        yield* this.postOrderTraversal(child);
      }
    }
    yield node;
  }

  insert(parentNodeKey: any, key: any, value = key) {
    for (let node of this.preOrderTraversal()) {
      if (node.key === parentNodeKey) {
        node.children.push(new TreeNode(key, value, node));
        return true;
      }
    }
    return false;
  }

  remove(key: any) {
    for (let node of this.preOrderTraversal()) {
      const filtered = node.children.filter(c => c.key !== key);
      if (filtered.length !== node.children.length) {
        node.children = filtered;
        return true;
      }
    }
    return false;
  }

  find(key: any) {
    for (let node of this.preOrderTraversal()) {
      if (node.key === key) return node;
    }
    return undefined;
  }

  update(key: any, value) {
    for (let node of this.preOrderTraversal()) {
      if (node.key === key) {
        node.value = value;
        return true;
      }
    }
    return false;
  }
}

class TreeNode {
  key: any;
  value: any;
  parent: any;
  children: any;

  constructor(key: any, value = key, parent = null) {
    this.key = key;
    this.value = value;
    this.parent = parent;
    this.children = [];
  }

  get isLeaf() {
    return this.children.length === 0;
  }

  get hasChildren() {
    return !this.isLeaf;
  }
}