function SelfVue(options) {
  var self = this;
  this.vm = this;
  this.data = options.data;
  Object.keys(this.data).forEach(key => self.proxyKey(key));
  // 添加数据拦截器
  observe(this.data);

  new Compile(options.el, this.vm);

  return this;
}

SelfVue.prototype = {
  constructor: SelfVue,
  // 添加 this 的属性代理
  proxyKey(key) {
    var self = this;
    Object.defineProperty(self, key, {
      enumerable: false,
      configurable: true,
      set(v) {
        self.data[key] = v;
      },
      get() {
        return self.data[key];
      },
    });
  },
};
