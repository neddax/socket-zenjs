const generateUUID = require("./generateUUID");

module.exports = class WsConnection {
  // private _socket: WS;
  // closed: boolean;

  constructor(
    socket,
    messageHandler,
    errorHandler,
    closeHandler,
    onConnectionHandler
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

  send(status, data = "") {
    if (status && data) {
      this._socket.send(
        JSON.stringify({
          data: data,
          status,
        })
      );

      return this;
    }

    console.error("send MUST have truthy a status[1]");
  }

  _onConnection(handler) {
    handler(this);
  }

  _onerror(err, errorHandler) {
    errorHandler(this, err);
  }

  _onclose(code, reason, closeHandler) {
    closeHandler(this, code, reason);
    this.closed = true;
  }

  _onmessage(data, messageHandler) {
    let json = {};

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
          messageHandler(this, json);
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
};
