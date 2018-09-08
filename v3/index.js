// 生命周期函数
// beforeCreate
// created
// beforeMount
// mounted
// beforeUpdate
// updated
// beforeDestroy
// destroyed

function SelfVue(options) {
  var self = this;
  this.vm = this;
  this.data = options.data;
  this.methods = options.methods;

  var {
    beforeCreate,
    created,
    beforeMount,
    mounted,
    beforeUpdate,
    updated,
    beforeDestroy,
    destroyed,
  } = options;

  // ---------------------------------
  // 属性绑定
  // ---------------------------------
  // 绑定代理属性，只对最顶层的 key 设置了代理属性
  Object.keys(self.data).forEach(key => self.proxyKeys(key));

  // ---------------------------------
  // Init Events 初始化methods
  // ---------------------------------
  // 挂载所有方法到 this 上下文上面
  Object.keys(self.methods).forEach((funcName) => {
    // 将方法挂在到 this 上
    self[funcName] = self.methods[funcName];
  });

  // ---------------------------------
  // beforeCreate (在Init Events 和 Lifecycle 之间)
  // ---------------------------------
  beforeCreate && beforeCreate.call(this);

  // 添加数据视图绑定触发器
  observe(this.data);

  // ---------------------------------
  // created (在Init injections 和 reactivity 之间)
  // ---------------------------------
  created && created.call(this);

  // 实现将node结点与视图绑定
  new Compile(options.el, this.vm, { beforeMount, mounted });

  return this;
}

SelfVue.prototype = {
  constructor: SelfVue,
  // 对每个属性做一个代理，方便直接通过属性获取
  proxyKeys(key) {
    var self = this;
    Object.defineProperty(this, key, {
      enumerable: false,
      configurable: true,
      get() {
        return self.data[key];
      },
      set(newVal) {
        self.data[key] = newVal;
      },
    });
  },
};
