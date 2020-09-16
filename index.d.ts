// Type definitions for [~THE LIBRARY NAME~] [~OPTIONAL VERSION NUMBER~]
// Project: [~THE PROJECT NAME~]
// Definitions by: [~YOUR NAME~] <[~A URL FOR YOU~]>

/*~ This is the module template file for class modules.
 *~ You should rename it to index.d.ts and place it in a folder with the same name as the module.
 *~ For example, if you were writing a file for "super-greeter", this
 *~ file should be 'super-greeter/index.d.ts'
 */

// Note that ES6 modules cannot directly export class objects.
// This file should be imported using the CommonJS-style:
//   import x = require('[~THE MODULE~]');
//
// Alternatively, if --allowSyntheticDefaultImports or
// --esModuleInterop is turned on, this file can also be
// imported as a default import:
//   import x from '[~THE MODULE~]';
//
// Refer to the TypeScript documentation at
// https://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require
// to understand common workarounds for this limitation of ES6 modules.

/*~ If this module is a UMD module that exposes a global variable 'myClassLib' when
 *~ loaded outside a module loader environment, declare that global here.
 *~ Otherwise, delete this declaration.
 */
export as namespace SocketZenjs;

/*~ This declaration specifies that the class constructor function
 *~ is the exported object from the file
 */
export = this;

import LowLevel from "./LowLevel";
import querystring from "querystring";
import { Server } from "http";
import WsConnection from "./WsConnection";
import Router from "./router";

/*~ Write your module's methods and properties in this class */
declare class SocketServer extends LowLevel {
  private _catch: SocketServer.FinalMessageHandler;

  private _routes: Record<string, SocketServer.FinalMessageHandler>;
  private _beforeMiddleWare: SocketServer.BeforeMiddleWareHandler[];

  constructor();

  initSocket(server: Server): this;

  on(url: string, handle: SocketServer.FinalMessageHandler): this;

  addRouter(router: Router): this;

  use(handle: SocketServer.BeforeMiddleWareHandler): this;

  catch(handle: SocketServer.FinalMessageHandler): this;

  _onMessage(
    connection: WsConnection,
    { data, url }: WsConnection.Message
  ): this;

  onConnection(handler: WsConnection.ConnectionHandler): this;

  onError(handler: WsConnection.ErrorHandler): this;

  onClose(handler: WsConnection.CloseHandler): this;

  private _parseURL(str: string): querystring.ParsedUrlQuery;

  private _cleanURL(str: string): string;

  Router(base): Router;
}

/*~ If you want to expose types from your module as well, you can
 *~ place them in this block.
 *~
 *~ Note that if you decide to include this namespace, the module can be
 *~ incorrectly imported as a namespace object, unless
 *~ --esModuleInterop is turned on:
 *~   import * as x from '[~THE MODULE~]'; // WRONG! DO NOT DO THIS!
 */
declare namespace SocketServer {
  export type BeforeMiddleWareHandler = (
    connection: WsConnection,
    request: SocketServer.SocketServerRequest,
    stop: () => void,
    injections: any[]
  ) => void;
  export interface SocketServerRequest extends WsConnection.Message {
    query: querystring.ParsedUrlQuery;
  }

  export type FinalMessageHandler = (
    connection: WsConnection,
    request: SocketServer.SocketServerRequest,
    injections: any[]
  ) => void;
}
