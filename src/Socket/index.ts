import * as WS from "ws";
import generateUUID from "../generateUUID";

export interface Message {
  url: string;
  data: any;
}
export type ConnectionHandler = (connection: Socket) => void;

export type MessageHandler = (connection: Socket, data: Message) => void;

export type ErrorHandler = (connection: Socket, error: Error) => void;
export type CloseHandler = (
  connection: Socket,
  code: number,
  reason: string
) => void;

export default class Socket {
  private _socket: WS;
  closed: boolean;
  uuid: string;
  close: () => void;

  constructor(
    socket: WS,
    messageHandler: MessageHandler,
    errorHandler: ErrorHandler,
    closeHandler: CloseHandler,
    onConnectionHandler: ConnectionHandler
  ) {
    this.uuid = generateUUID();
    this.closed = false;
    this._socket = socket;
    this.close = () => this._socket.close();

    this._socket.on("connection", () =>
      this._onConnection(onConnectionHandler)
    );

    this._socket.on("close", (code, reason) =>
      this._onclose(code, reason, closeHandler)
    );
    this._socket.on("error", (error) => this._onerror(error, errorHandler));
    this._socket.on("message", (data) => this._onmessage(data, messageHandler));
  }

  send(status: number = 200, data = "") {
    if (typeof status === "number") {
      this._socket.send(
        JSON.stringify({
          data: data,
          status,
        })
      );

      return this;
    }
  }

  _onConnection(handler: ConnectionHandler) {
    handler(this);
  }

  _onerror(err: Error, errorHandler: ErrorHandler) {
    errorHandler(this, err);
  }

  _onclose(code: number, reason: string, closeHandler: CloseHandler) {
    closeHandler(this, code, reason);
    this.closed = true;
  }

  _onmessage(data: WS.Data, messageHandler: MessageHandler) {
    let json: Record<string, any> = {};

    try {
      json = JSON.parse(data.toString());
    } catch (err) {
      this.send(
        400,
        'You must send a object that looks like: "{url: string, data: !undefined}"'
      );
    }

    if (typeof json !== "string") {
      if (typeof json.url === "string") {
        if (json.data !== undefined) {
          messageHandler(this, json as Message);
        } else
          this.send(
            400,
            'missing .data as type any && !undefined "{data: [] | {} | "" | null}" '
          );
      } else this.send(400, 'missing .url as type string "{url: string}"');
    } else {
      this.send(400, "failed to parse message into an object");
    }
  }
}
