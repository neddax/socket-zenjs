const WS = require("ws");
const WsConnection = require("./WsConnection");

module.exports = class LowLevel {
  constructor() {
    this._connections = [];
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

  _removeConnection(connection) {
    this._connections = this._connections.filter((c) => c !== connection);
  }

  _addConnection(connection) {
    this._connections = this._connections.concat(connection);
  }

  handleConnection(socket) {
    const req = new WsConnection(
      socket,
      this._onMessage,
      this._onError,
      this._onClose
    );

    this._addConnection(req);
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
