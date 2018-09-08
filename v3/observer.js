// 对传入进来的对象进行属性扫描，对属性的描述符进行修改，添加监听器
function Observer(data) {
  this.data = data;
  this.walk(data);
}

Observer.prototype = {
  walk(data) {
    var self = this;
    Object.keys(data).forEach(key => self.defineReactive(data, key, data[key]));
  },
  defineReactive(data, key, val) {
    var dep = new Dep();
    var childObj = observe(val);
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: true,
      set(newVal) {
        // 前后两次的值是相同的则不往后面执行
        if (val === newVal) {
          return;
        }
        val = newVal;
        console.log('属性 ' + key + ' 已经被监听了，现在值为：' + newVal);
        // 在设置属性的时候，前后的值不同会触发事件通知
        dep.notify();
      },
      get() {
        if (Dep.target) {
          // 如果确定需要监听该目标，则在获取该目标属性的时候，会将该属性添加到事件发布的队列里面去
          dep.addSub(Dep.target);
        }
        return val;
      },
    });
  },
};

function observe(value, vm) {
  if (!value || typeof value !== 'object') {
    return;
  }
  return new Observer(value);
}

function Dep() {
  this.subs = [];
}

Dep.prototype = {
  constructor: Dep,
  addSub(sub) {
    this.subs.push(sub);
  },
  notify() {
    this.subs.forEach(sub => sub.update());
  },
};

Dep.target = null;
