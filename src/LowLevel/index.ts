import * as WS from "ws";
import Socket, { Message } from "../Socket";
import * as http from "http";

export default class LowLevel<SocketState extends Record<string, any>> {
  private _connections: Socket<SocketState>[];
  get connections() {
    return this._connections;
  }

  ws: WS.Server | null;
  baseSocketState: SocketState;

  constructor(baseSocketState: SocketState) {
    this._connections = [];
    this.ws = null;
    this.baseSocketState = baseSocketState;
  }

  initLL(server: http.Server) {
    this.ws = new WS.Server({ server });
    this.ws.on("connection", (socket) =>
      this.handleConnection(socket, this.baseSocketState)
    );
    return this;
  }

  _removeConnection(connection: Socket<SocketState>) {
    this._connections = this._connections.filter((c) => c !== connection);
  }

  _addConnection(connection: Socket<SocketState>) {
    this._connections = this._connections.concat(connection);
  }

  handleConnection(socket: WS, state: SocketState) {
    const req = new Socket<SocketState>(
      socket,
      this._onMessage,
      this._onError,
      this._onClose,
      this._onConnection,
      state
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

  _onConnection(_: Socket<SocketState>) {
    console.info("Connection made!");
  }

  _onMessage(_: Socket<SocketState>, { data, url }: Message) {
    console.info(`[${url}]`);
    console.info(data);
  }

  _onError(_: Socket<SocketState>, error: Error) {
    console.error("ERROR!", error);
  }

  _onClose(connection: Socket<SocketState>, code: number, reason: string) {
    console.info("CLOSING!");
    console.info(`[code][${code}] Reason\n${reason}`);
  }
}
