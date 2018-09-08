function SelfVue(ele, data, exp) {
  var self = this;
  this.data = data;
  Object.keys(this.data).forEach(key => self.proxyKey(key));
  observe(this.data);
  ele.innerHTML = this.data[exp];
  new Watcher(this, exp, function (value) {
    ele.innerHTML = value;
  });
  return this;
}

SelfVue.prototype = {
  constructor: SelfVue,
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