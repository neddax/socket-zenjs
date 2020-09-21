import * as WS from "ws";
import generateUUID from "../generateUUID";

export interface Message {
  url: string;
  data: any;
}
export type ConnectionHandler<State> = (connection: Socket<State>) => void;

export type MessageHandler<State> = (
  connection: Socket<State>,
  data: Message
) => void;

export type ErrorHandler<State> = (
  connection: Socket<State>,
  error: Error
) => void;
export type CloseHandler<State> = (
  connection: Socket<State>,
  code: number,
  reason: string
) => void;

export default class Socket<State extends Record<string, any>> {
  private _socket: WS;
  closed: boolean;
  uuid: string;
  close: () => void;
  state: State;

  constructor(
    socket: WS,
    messageHandler: MessageHandler<State>,
    errorHandler: ErrorHandler<State>,
    closeHandler: CloseHandler<State>,
    onConnectionHandler: ConnectionHandler<State>,
    state: State
  ) {
    this.state = state;
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

  async send(status: number = 200, data: any = "") {
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

  _onConnection(handler: ConnectionHandler<State>) {
    handler(this);
  }

  _onerror(err: Error, errorHandler: ErrorHandler<State>) {
    errorHandler(this, err);
  }

  _onclose(code: number, reason: string, closeHandler: CloseHandler<State>) {
    closeHandler(this, code, reason);
    this.closed = true;
  }

  _onmessage(data: WS.Data, messageHandler: MessageHandler<State>) {
    let json: Record<string, any> = {};

    /*
    
      {
        url: '/',
        data: {},
      }
    */

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
