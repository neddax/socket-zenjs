import LowLevel from "./LowLevel";
import querystring from "querystring";
import { Server } from "http";
import WsConnection from "./WsConnection";
import {
  SocketServerMessageHandler,
  SocketServerRequest,
  CloseHandler,
  ErrorHandler,
  Message,
} from "./types";

export default class SocketServer extends LowLevel {
  private _catch: SocketServerMessageHandler;

  routes: Record<string, SocketServerMessageHandler>;

  constructor() {
    super();
    this.routes = {};
  }

  initSocket(server: Server) {
    this.initLL(server);
  }

  on(url: string, handle: SocketServerMessageHandler) {
    this.routes[url] = handle;
    return this;
  }

  catch(handle: SocketServerMessageHandler) {
    this._catch = handle;
    return this;
  }

  _onMessage = (connection: WsConnection, { data, url }: Message) => {
    const request: SocketServerRequest = {
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

  onError(handler: ErrorHandler) {
    this._onError = handler;
    return this;
  }

  onClose(handler: CloseHandler) {
    this._onClose = handler;
    return this;
  }

  private _parseURL(str: string) {
    let query: querystring.ParsedUrlQuery = {};

    const index = str.indexOf("?");

    if (index !== -1) {
      console.log("str.slice(index)", str.slice(index + 1));
      query = querystring.parse(str.slice(index));
    }

    return query;
  }

  private _cleanURL(str: string) {
    const index = str.indexOf("?");

    if (index !== -1) {
      str = str.slice(0, index);
    }

    return str;
  }
}
