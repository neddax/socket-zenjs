const LowLevel = require("./LowLevel");
const querystring = require("querystring");

module.exports = class SocketServer extends LowLevel {
  constructor() {
    super();
    this.routes = {};
  }

  initSocket(server) {
    this.initLL(server);
  }

  on(url, handle) {
    this.routes[url] = handle;
    return this;
  }

  catch(handle) {
    this._catch = handle;
    return this;
  }

  _onMessage = (connection, { data, url }) => {
    const request = {
      data: data,
      url: this._cleanURL(url),
      query: this._parseURL(url),
    };

    if (this.routes[request.url]) {
      this.routes[request.url](connection, request);
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

  _parseURL(str) {
    let query = {};

    const index = str.indexOf("?");

    if (index !== -1) {
      console.log("str.slice(index)", str.slice(index + 1));
      query = querystring.parse(str.slice(index));
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
};
