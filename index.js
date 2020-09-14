const LowLevel = require("./LowLevel");
const querystring = require("querystring");
const Router = require("./router");
module.exports = class SocketServer extends LowLevel {
  constructor() {
    super();
    this._routes = {};
    this._beforeMiddleWare = [];
  }

  initSocket(server) {
    this.initLL(server);
  }

  on(url, handle) {
    this._routes[url] = handle;
    return this;
  }

  catch(handle) {
    this._catch = handle;
    return this;
  }

  addRouter(router) {
    for (const path in router._routes)
      this._routes[router._base + path] = router._routes[path];

    return this;
  }

  use(handle) {
    this._beforeMiddleWare.push(handle);
    return this;
  }

  _onMessage = (connection, { data, url }) => {
    const request = {
      data: data,
      url: this._cleanURL(url),
      query: this._parseURL(url),
    };

    if (this._routes[request.url]) {
      let dontRespond = false;

      const stop = () => {
        dontRespond = true;
      };

      for (const middleWare of this._beforeMiddleWare) {
        middleWare(connection, request, stop);
        if (dontRespond) return;
      }

      this._routes[request.url](connection, request);
    } else {
      if (this.catch) this._catch(connection, request);
      else connection.send(404, "Route not found");
    }
  };

  onError(handler) {
    this._onError = handler;
    return this;
  }

  onClose(handler) {
    this._onClose = handler;
    return this;
  }

  onConnection(handler) {
    this._onConnection = handler;
    return this;
  }

  _parseURL(str) {
    let query = {};

    const index = str.indexOf("?");

    if (index !== -1) {
      query = querystring.parse(str.slice(index + 1));
    }

    return query;
  }

  _cleanURL(str) {
    const index = str.indexOf("?");

    if (index !== -1) {
      str = str.slice(0, index);
    }

    return str;
  }

  static Router(base) {
    return new Router(base);
  }
};
