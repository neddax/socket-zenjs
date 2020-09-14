module.exports = class Router {
  constructor(base) {
    // base url ie: base == /api/v1
    // then when you call .on()
    // you can simply do
    // .on('/users', () => {})
    // and if you add this router to the base ZenJs
    // the url will look like
    // /api/v1/users

    this._base = base;
    this._routes = {};
    this._beforeMiddleWare = [];
  }

  on(url, handle) {
    this._routes[url] = this._newRoute(handle);
    return this;
  }

  use(handle) {
    this._beforeMiddleWare.push(handle);
    return this;
  }

  addRouter(router) {
    for (const path in router._routes)
      this._routes[router._base + path] = this._newRoute(router._routes[path]);

    return this;
  }

  /**
   *  @param base String
   *  @returns new Router(this.base + base)
   */
  Router(base) {
    return new Router(this.base + base);
  }

  _newRoute(handle) {
    return (connection, request) => {
      let dontRespond = false;

      const stop = () => {
        dontRespond = true;
      };

      for (const middleWare of this._beforeMiddleWare) {
        middleWare(connection, request, stop);
        if (dontRespond) return;
      }

      handle(connection, request);
    };
  }
};
