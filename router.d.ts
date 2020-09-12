export as namespace Router;

export = Router;

import SocketServer from "./index";

/*~ Write your module's methods and properties in this class */
declare class Router {
  private _routes: Record<string, SocketServer.SocketServerMessageHandler>;
  private _base: string;
  private _beforeMiddleWare: [];

  constructor(base: string);

  on(
    url: string,
    handle: SocketServer.SocketServerMessageHandler
  ): SocketServer;

  use(handle: SocketServer.BeforeMiddleWareHandler): Router;

  addRouter(router: Router): Router;

  Router(base): Router;

  private _newRoute(
    handle: SocketServer.SocketServerMessageHandler
  ): SocketServer.SocketServerMessageHandler;
}

declare namespace Router {}
