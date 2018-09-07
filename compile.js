function Compile(el, vm, lifecycle) {
  this.vm = vm;
  this.lifecycle = lifecycle; // beforeMount 和 mounted 生命周期函数的挂载点
  this.el = document.querySelector(el);
  this.fragment = null;
  this.init();
}

Compile.prototype = {
  constructor: Compile,
  init() {
    if (this.el) {
      // 变成内存节点
      var {
        beforeMount,
        mounted,
      } = this.lifecycle;
      beforeMount && beforeMount.call(this.vm);
      this.fragment = this.nodeToFragment(this.el);
      // 实现结点的数据绑定
      this.compileElement(this.fragment);
      // 将 el 的子节点全部虚拟化绑定之后，再重新放置到 el 中，显示效果原样不变
      this.el.appendChild(this.fragment);

      // mounted 组件挂载好了
      mounted && mounted.call(this.vm);
    } else {
      console.log('DOM 元素不存在');
    }
  },
  // dom 结点变成内存结点
  nodeToFragment(el) {
    var fragment = document.createDocumentFragment();
    var child = el.firstChild;
    while(child) {
      // 将dom元素移到 fragment 中
      fragment.appendChild(child);
      child = el.firstChild;
    }
    return fragment;
  },
  compileElement(el) {
    var self = this;
    var childNodes = el.childNodes;
    // 循环遍历所有结点及其子节点
    [].slice.call(childNodes).forEach(node => {
      var reg = /\{\{(.*)\}\}/;
      var text = node.textContent;
      // 是否是元素结点 nodeType === 1
      if (self.isElementNode(node)) {
        self.compile(node);
      } else if (self.isTextNode(node) && reg.test(text)) {
      // 是文本结点，而且内容符合 {{}} 规则
        // 判断是否是符合 {{}} 的指令
        self.compileText(node, reg.exec(text)[1]);
      }
      if (node.childNodes && node.childNodes.length) {
        // 会遍历到最底层，<h1>{{title}}</h1>   h1 nodeType === 1，{{title}} nodeType === 3
        self.compileElement(node);
      }
    });
  },
  compile(node) {
    var self = this;
    var nodeAttrs = node.attributes;

    // 对每个结点的每个属性都做一次遍历，筛选出要处理的指令
    Array.prototype.forEach.call(nodeAttrs, function(attr) {
      var attrName = attr.name;
      if (self.isDirective(attrName)) {
        var exp = attr.value;
        var dir = attrName.substring(2);
        if (self.isEventDirective(dir)) {
          // event 命令
          self.compileEvent(node, self.vm, exp, dir);
        } else {
          // v-model 命令
          self.compileModel(node, self.vm, exp, dir);
        }
        // 移除属性名
        node.removeAttribute(attrName);
      }
    });
  },
  // 编译 event
  compileEvent(node, vm, exp, dir) {
    var eventType = dir.split(':')[1];
    var cb = vm.methods && vm.methods[exp];
    if (eventType && cb) {
      node.addEventListener(eventType, cb.bind(vm), false);
    }
  },
  // 编译 model
  compileModel(node, vm, exp, dir) {
    var self = this;
    var val = self.vm[exp];
    this.modelUpdater(node, self.vm[exp]);

    // -------------------------------
    // Model -> View
    // 对 model 绑定的属性添加监听
    // 当 self.vm[exp] 的值更改的时候，会执行后面的回调函数，从而换新视图
    new Watcher(self.vm, exp, function (value) {
      self.modelUpdater(node, value);
    });

    // --------------------------------
    // View -> Model View层触发Model层的数据改变
    // 给结点添加输入的时候时间监听绑定
    node.addEventListener('input', function (event) {
      var newValue = event.target.value;
      if (val === newValue) {
        return;
      }
      self.vm[exp] = newValue;
      val = newValue;
    });
  },
  // 将属性以及拥有该属性的结点进行数据绑定
  // 每次调用该方法的时候，都会对属性和 node 结点进行绑定，以实现数据更新，视图更新
  compileText(node, exp) {
    var self = this;
    var initText = this.vm[exp]; // 获取到该属性的值
    this.updateText(node, initText); // 将初始化的数据初始化到视图中
    // 生成订阅器并绑定新函数
    // 如果 exp 属性变化了，则会执行下面的回调函数，用以更新属性值
    new Watcher(this.vm, exp, function(value) {
      self.updateText(node, value);
    });
  },
  // 将 value 值更新到结点的属性上
  updateText(node, value) {
    node.textContent = typeof value === 'undefined'? '': value;
  },
  // 给结点的 value 赋值
  modelUpdater(node, value, oldValue) {
    node.value = typeof value === 'undefined'? '': value;
  },
  // 是不是指令？以 v- 开头
  isDirective(attr) {
    return attr.indexOf('v-') === 0;
  },
  // 是否是时间指令？以 on: 开头
  isEventDirective(dir) {
    return dir.indexOf('on:') === 0;
  },
  // 是否是元素结点
  isElementNode(node) {
    return node.nodeType === 1;
  },
  // 判断是不是最原始的 Text 结点，纯文本结点，不是标签
  isTextNode(node) {
    return node.nodeType === 3;
  },
};



