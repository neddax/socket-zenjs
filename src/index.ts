import * as querystring from "querystring";
import LowLevel from "./LowLevel";
import Router from "./Router";
import Socket, {
  CloseHandler,
  ConnectionHandler,
  ErrorHandler,
  Message,
} from "./Socket";
import * as http from "http";
import { throws } from "assert";

const copy = (obj: any) => JSON.parse(JSON.stringify(obj));

export type FinalConnectionHandler<T> = (
  connection: Socket,
  injections: T
) => void;

export type BeforeMiddleWareHandler<T> = (
  connection: Socket,
  request: SocketServerRequest,
  stop: () => void,
  injections: T
) => void;

export interface SocketServerRequest extends Message {
  query: querystring.ParsedUrlQuery;
}

export type FinalMessageHandler<T> = (
  connection: Socket,
  request: SocketServerRequest,
  injections: T
) => void;

export default class Zenjs<
  Injections extends Record<string, any>
> extends LowLevel {
  private _injections: Injections;
  // @ts-ignore This value comes from LowLevel, But we have it here for extended
  // typing
  private _catch: FinalMessageHandler<Injections>;
  private _routes: Record<string, FinalMessageHandler<Injections>>;
  private _beforeMiddleWare: BeforeMiddleWareHandler<Injections>[];

  constructor(injections: Injections) {
    super();

    this._injections = injections;
    this._routes = {};
    this._beforeMiddleWare = [];
  }

  updateInjection<T extends keyof Injections>(key: T, value: Injections[T]) {
    this._injections[key] = value;
    return this;
  }

  /**
   * @param server http.Server
   * @returns this
   */
  initSocket(server: http.Server) {
    this.initLL(server);
    return this;
  }

  on(url: string, handle: FinalMessageHandler<Injections>) {
    this._routes[url] = handle;
    return this;
  }

  catch(handle: FinalMessageHandler<Injections>) {
    this._catch = handle;
    return this;
  }

  addRouter(router: Router<Injections>) {
    for (const path in router.routes)
      this._routes[router.base + path] = router.routes[path];

    return this;
  }

  use(handle: BeforeMiddleWareHandler<Injections>) {
    this._beforeMiddleWare.push(handle);
    return this;
  }

  _onMessage = (connection: Socket, req: SocketServerRequest) => {
    const copyOfReq = copy(req);
    delete copyOfReq.url;
    delete copyOfReq.data;
    delete copyOfReq.query;

    const request = {
      ...copyOfReq,
      data: req.data,
      url: this._cleanURL(req.url),
      query: this._parseURL(req.url),
    };

    if (this._routes[request.url]) {
      let dontRespond = false;

      const stop = () => {
        dontRespond = true;
      };

      for (const middleWare of this._beforeMiddleWare) {
        middleWare(connection, request, stop, this._injections);
        if (dontRespond) return;
      }

      this._routes[request.url](connection, request, this._injections);
    } else {
      // @ts-ignore
      if (this._catch) {
        this._catch(connection, request, this._injections);
      } else connection.send(404, "Route not found");
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

  onConnection(handler: FinalConnectionHandler<Injections>) {
    this._onConnection = (socket) => handler(socket, this._injections);
    return this;
  }

  private _parseURL(str: string) {
    let query = {};

    const index = str.indexOf("?");

    if (index !== -1) {
      query = querystring.parse(str.slice(index + 1));
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

  Router(base: string) {
    return new Router<Injections>(base);
  }
}
