function Watcher(vm, exp, cb) {
  this.cb = cb;
  this.vm = vm;
  this.exp = exp;
  this.value = this.get(); // 将自己添加到订阅器的操作
}

Watcher.prototype = {
  constructor: Watcher,
  update() {
    this.run();
  },
  run() {
    var value = this.vm.data[this.exp];
    var oldVal = this.value;
    if (value !== oldVal) {
      this.value = value;
      this.cb.call(this.vm, value, oldVal);
    }
  },
  get() {
    Dep.target = this; // 缓存自己
    var value = this.vm.data[this.exp]; // 强制执行监听器里面的函数，get的时候回自动将该 Dep.target 添加到队列数组中
    Dep.target = null;
    return value;
  },
};
