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

const copy = (obj: any) => JSON.parse(JSON.stringify(obj));

export type HandlesType<
  Injections,
  SocketState,
  State,
  Handle extends HandlesType<Injections, SocketState, State, Handle>
> = Record<
  string,
  (server: Zenjs<Injections, SocketState, State, Handle>, ...args: any[]) => any
>;

export type FinalConnectionHandler<
  Injections,
  SocketState,
  State,
  Handles extends HandlesType<Injections, SocketState, State, Handles>
> = (
  connection: Socket<SocketState>,
  server: Zenjs<Injections, SocketState, State, Handles>
) => void;

export type BeforeMiddleWareHandler<
  Injections,
  SocketState,
  State,
  Handles extends HandlesType<Injections, SocketState, State, Handles>
> = (
  connection: Socket<SocketState>,
  request: SocketServerRequest,
  stop: () => void,
  server: Zenjs<Injections, SocketState, State, Handles>
) => void;

export interface SocketServerRequest extends Message {
  query: querystring.ParsedUrlQuery;
}

export type FinalMessageHandler<
  Injections,
  SocketState,
  State,
  Handles extends HandlesType<Injections, SocketState, State, Handles>
> = (
  connection: Socket<SocketState>,
  request: SocketServerRequest,
  server: Zenjs<Injections, SocketState, State, Handles>
) => void;

export default class Zenjs<
  Injections extends Record<string, any>,
  SocketState extends Record<string, any>,
  State extends Record<string, any>,
  Handles extends HandlesType<Injections, SocketState, State, Handles>
> extends LowLevel<SocketState> {
  private _injections: Injections;
  // @ts-ignore This value comes from LowLevel, But we have it here for extended
  // typing
  private _catch: FinalMessageHandler<Injections, SocketState, State, Handles>;
  private _routes: Record<
    string,
    FinalMessageHandler<Injections, SocketState, State, Handles>
  >;
  private _beforeMiddleWare: BeforeMiddleWareHandler<
    Injections,
    SocketState,
    State,
    Handles
  >[];

  handles: Handles;
  state: State;

  constructor(
    injections: Injections,
    state: State,
    baseSocketState: SocketState,
    handles: Handles
  ) {
    super(baseSocketState);

    this.state = state || {};
    this.handles = handles || {};
    this._injections = injections || {};
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

  on(
    url: string,
    handle: FinalMessageHandler<Injections, SocketState, State, Handles>
  ) {
    this._routes[url] = handle;
    return this;
  }

  catch(handle: FinalMessageHandler<Injections, SocketState, State, Handles>) {
    this._catch = handle;
    return this;
  }

  addRouter(router: Router<Injections, SocketState, State, Handles>) {
    for (const path in router.routes) {
      this._routes[router.base + path] = router.routes[path];
    }

    return this;
  }

  use(
    handle: BeforeMiddleWareHandler<Injections, SocketState, State, Handles>
  ) {
    this._beforeMiddleWare.push(handle);
    return this;
  }

  _onMessage = (connection: Socket<SocketState>, req: SocketServerRequest) => {
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
        middleWare(connection, request, stop, this);
        if (dontRespond) return;
      }

      this._routes[request.url](connection, request, this);
    } else {
      // @ts-ignore
      if (this._catch) {
        this._catch(connection, request, this);
      } else connection.send(404, "Route not found");
    }
  };

  onError(handler: ErrorHandler<SocketState>) {
    this._onError = handler;
    return this;
  }

  onClose(handler: CloseHandler<SocketState>) {
    this._onClose = handler;
    return this;
  }

  onConnection(
    handler: FinalConnectionHandler<Injections, SocketState, State, Handles>
  ) {
    this._onConnection = (socket) => handler(socket, this);
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

  CreateRouter(base: string) {
    return new Router<Injections, SocketState, State, Handles>(base);
  }
}
