// 实现 Model层 -> View 的中间工具，监听数据变化的时候，通过回调函数实现数据刷新到视图上
function Watcher(vm, exp, cb) {
  this.vm = vm;
  this.cb = cb;
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
  // 把当前目标添加到通知队里面去
  get() {
    Dep.target = this; // 缓存自己
    var value = this.vm.data[this.exp]; // 强制执行监听器里面的函数，get的时候回自动将该 Dep.target 添加到队列数组中
    Dep.target = null;
    return value;
  },
};
