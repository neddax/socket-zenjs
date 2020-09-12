import { Server } from "http";
import WS from "ws";
import WsConnection, { Message } from "./WsConnection";

export default class LowLevel {
  ws: WS.Server;

  private _connections: WsConnection[];

  constructor() {
    this._connections = [];
  }

  initLL(server: Server) {
    this.ws = new WS.Server({ server });
    this.ws.on("connection", (socket) => this.handleConnection(socket));
    return this;
  }

  get getConnections() {
    return this._connections;
  }

  private _removeConnection(connection: WsConnection) {
    this._connections = this._connections.filter((c) => c !== connection);
  }

  private _addConnection(connection: WsConnection) {
    this._connections = this._connections.concat(connection);
  }

  private handleConnection(socket: WS) {
    const req = new WsConnection(
      socket,
      this._onMessage,
      this._onError,
      this._onClose
    );

    this._addConnection(req);
  }

  _onMessage(_: WsConnection, { data, url }: Message) {
    console.info(`[${url}]`);
    console.info(data);
  }

  _onError(_: WsConnection, error: Error) {
    console.error("ERROR!", error);
  }

  _onClose(connection: WsConnection, code: number, reason: string) {
    console.info("CLOSING!");
    console.info(`[code][${code}] Reason\n${reason}`);

    this._cleanUpClose(connection);
  }

  private _cleanUpClose(connection: WsConnection) {
    this._removeConnection(connection);
  }
}
