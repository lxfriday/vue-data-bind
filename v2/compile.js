function Compile(el, vm) {
  this.el = document.querySelector(el);
  this.vm = vm;
  this.fragment = null; // 用来装载编译后的 node
  this.init();
}

Compile.prototype = {
  constructor: Compile,
  // 初始化方法
  init() {
    this.fragment = this.nodeToFragment(this.el);
    this.compileElement(this.fragment);
    this.el.appendChild(this.fragment);
  },
  // 将 dom 结点变成 node
  nodeToFragment(el) {
    const fragment = document.createDocumentFragment();
    let child = el.firstChild;
    while(child) {
      fragment.appendChild(child);
      child = el.firstChild;
    }
    return fragment;
  },
  // 对结点进行属性绑定
  compileElement(fragment) {
    const self = this;
    const childNodes = fragment.childNodes;
    const reg = /\{\{(.*)\}\}/;
    [].forEach.call(childNodes, function (node) {
      const text = node.textContent;
      // nodeType === 3
      if (self.isTextNode(node) && reg.test(text)) {
        self.compileText(node, reg.exec(text)[1]);
      }
      // 递归循环，把所有的结点全部循环完
      if (node.childNodes && node.childNodes.length) {
        self.compileElement(node);
      }
    });
  },
  compileText(node, exp) {
    const self = this;
    self.updateText(node, self.vm.data[exp]);
    new Watcher(self.vm, exp, function (value) {
      self.updateText(node, value);
    });
  },
  updateText(node, value) {
    node.textContent = typeof value === 'undefined'? '': value;
  },
  isTextNode(node) {
    return node.nodeType === 3;
  },
};
