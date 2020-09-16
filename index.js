const LowLevel = require("./LowLevel");
const querystring = require("querystring");
const Router = require("./router");

const copy = (obj) => JSON.parse(JSON.stringify(obj));

module.exports = class Zenjs extends LowLevel {
  constructor(injections) {
    super();

    this._injections = injections;
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

  _onMessage = (connection, req) => {
    const copyOfReq = copy(req);
    delete copyOfReq.url;
    delete copyOfReq.data;
    delete copyOfReq.query;

    const request = {
      ...copyOfReq,
      data: req.data,
      url: this._cleanURL(req.url),
      query: this._parseURL(req.url),
    };

    if (this._routes[request.url]) {
      let dontRespond = false;

      const stop = () => {
        dontRespond = true;
      };

      for (const middleWare of this._beforeMiddleWare) {
        middleWare(connection, request, stop, this.getInjections);
        if (dontRespond) return;
      }

      this._routes[request.url](connection, request, this.getInjections);
    } else {
      if (this.catch) this._catch(connection, request, this.getInjections);
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
