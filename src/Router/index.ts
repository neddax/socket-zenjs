import {
  BeforeMiddleWareHandler,
  FinalMessageHandler,
  SocketServerRequest,
} from "../index";
import Socket from "../Socket";

export default class Router<Injections extends Record<string, any>> {
  base: string;
  routes: Record<string, FinalMessageHandler<Injections>>;
  beforeMiddleWare: BeforeMiddleWareHandler<Injections>[];

  constructor(base: string) {
    // base url ie: base == /api/v1
    // then when you call .on()
    // you can simply do
    // .on('/users', () => {})
    // and if you add this router to the base ZenJs
    // the url will look like
    // /api/v1/users

    this.base = base;
    this.routes = {};
    this.beforeMiddleWare = [];
  }

  on(url: string, handle: FinalMessageHandler<Injections>) {
    this.routes[url] = this._newRoute(handle);
    return this;
  }

  use(handle: BeforeMiddleWareHandler<Injections>) {
    this.beforeMiddleWare.push(handle);
    return this;
  }

  addRouter(router: Router<Injections>) {
    for (const path in router.routes)
      this.routes[router.base + path] = this._newRoute(router.routes[path]);

    return this;
  }

  _newRoute(handle: FinalMessageHandler<Injections>) {
    return (
      connection: Socket,
      request: SocketServerRequest,
      injections: Injections
    ) => {
      let dontRespond = false;

      for (const middleWare of this.beforeMiddleWare) {
        middleWare(
          connection,
          request,
          () => {
            dontRespond = true;
          },
          injections
        );
        if (dontRespond) return;
      }

      handle(connection, request, injections);
    };
  }
}
