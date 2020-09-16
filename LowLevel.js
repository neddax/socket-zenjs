const WS = require("ws");
const ZenSocketConnection = require("./ZenSocketConnection");

module.exports = class LowLevel {
  constructor() {
    this._connections = [];
    this._injections = [];
    this.ws = null;
  }

  initLL(server) {
    this.ws = new WS.Server({ server });
    this.ws.on("connection", (socket) => this.handleConnection(socket));
    return this;
  }

  get getConnections() {
    return this._connections;
  }

  get getInjections() {
    return this._injections;
  }

  _removeConnection(connection) {
    this._connections = this._connections.filter((c) => c !== connection);
  }

  _addConnection(connection) {
    this._connections = this._connections.concat(connection);
  }

  handleConnection(socket) {
    const req = new ZenSocketConnection(
      socket,
      this._onMessage,
      this._onError,
      this._onCl_injectionsose,
      this._onConnection
    );

    this._addConnection(req);
  }

  sendTo(uuid, status, data) {
    const index = this._connections.findIndex(({ uuid: id }) => uuid === id);
    if (index !== -1) {
      this._connections[index].send(status, data);
    }

    return this;
  }

  sendAll(status, data) {
    for (const connection of this._connections) {
      connection.send(status, data);
    }

    return this;
  }

  inject(anything) {
    this._injections = this._injections.concat(anything);
    return this;
  }

  _onConnection(_) {
    console.info("Connection made!");
  }

  _onMessage(_, { data, url }) {
    console.info(`[${url}]`);
    console.info(data);
  }

  _onError(_, error) {
    console.error("ERROR!", error);
  }

  _onClose(connection, code, reason) {
    console.info("CLOSING!");
    console.info(`[code][${code}] Reason\n${reason}`);
  }
};
