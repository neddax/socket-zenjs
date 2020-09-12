import WS from "ws";
import { CloseHandler, ErrorHandler, Message, MessageHandler } from "./types";

export default class WsConnection {
  private _socket: WS;

  closed: boolean;

  constructor(
    socket: WS,
    messageHandler: MessageHandler,
    errorHandler: ErrorHandler,
    closeHandler: CloseHandler
  ) {
    this.closed = false;
    this._socket = socket;

    this._socket.on("close", (code, reason) =>
      this._onclose(code, reason, closeHandler)
    );
    this._socket.on("error", (error) => this._onerror(error, errorHandler));
    this._socket.on("message", (data) => this._onmessage(data, messageHandler));
  }

  send(status: number, data: any = "") {
    if (status && data) {
      this._socket.send(
        JSON.stringify({
          data: data,
          status,
        })
      );

      return this;
    }

    throw new Error("send MUST have truthy a status[1]");
  }

  private _onerror(err: Error, errorHandler: ErrorHandler) {
    errorHandler(this, err);
  }

  private _onclose(code: number, reason: string, closeHandler: CloseHandler) {
    closeHandler(this, code, reason);
    this.closed = true;
  }

  private _onmessage(data: WS.Data, messageHandler: MessageHandler) {
    let json: Message;

    try {
      json = JSON.parse(data.toString());
    } catch (err) {
      this.send(
        400,
        'You must send a object that looks like: "{url: string, data: !undefined}"'
      );
    }

    if (typeof json.url === "string") {
      if (typeof json.data !== undefined) {
        messageHandler(this, json);
      } else
        this.send(
          400,
          'Object json is missing .data as type any && !undefined "{data: [] | {} | "" | null}" '
        );
    } else
      this.send(
        400,
        'Object json is missing .url as type string "{url: string}"'
      );
  }
}
