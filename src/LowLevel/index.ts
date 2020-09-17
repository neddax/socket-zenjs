import * as WS from "ws";
import Socket, { Message } from "../Socket";
import * as http from "http";

export default class LowLevel {
  private _connections: Socket[];
  ws: WS.Server | null;

  constructor() {
    this._connections = [];
    this.ws = null;
  }

  initLL(server: http.Server) {
    this.ws = new WS.Server({ server });
    this.ws.on("connection", (socket) => this.handleConnection(socket));
    return this;
  }

  _removeConnection(connection: Socket) {
    this._connections = this._connections.filter((c) => c !== connection);
  }

  _addConnection(connection: Socket) {
    this._connections = this._connections.concat(connection);
  }

  handleConnection(socket: WS) {
    const req = new Socket(
      socket,
      this._onMessage,
      this._onError,
      this._onClose,
      this._onConnection
    );

    this._addConnection(req);
  }

  sendTo(uuid: string, status: number, data: any) {
    const index = this._connections.findIndex(({ uuid: id }) => uuid === id);
    if (index !== -1) {
      this._connections[index].send(status, data);
    }

    return this;
  }

  sendAll(status: number, data: any) {
    for (const connection of this._connections) {
      connection.send(status, data);
    }

    return this;
  }

  _onConnection(_: Socket) {
    console.info("Connection made!");
  }

  _onMessage(_: Socket, { data, url }: Message) {
    console.info(`[${url}]`);
    console.info(data);
  }

  _onError(_: Socket, error: Error) {
    console.error("ERROR!", error);
  }

  _onClose(connection: Socket, code: number, reason: string) {
    console.info("CLOSING!");
    console.info(`[code][${code}] Reason\n${reason}`);
  }
}
