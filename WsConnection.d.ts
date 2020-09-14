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
export as namespace myClassLib;

/*~ This declaration specifies that the class constructor function
 *~ is the exported object from the file
 */
export = WsConnection;

import WS from "ws";

/*~ Write your module's methods and properties in this class */
declare class WsConnection {
  private _socket: WS;
  closed: boolean;
  uuid: string;

  constructor(
    socket: WS,
    messageHandler: WsConnection.MessageHandler,
    errorHandler: WsConnection.ErrorHandler,
    closeHandler: WsConnection.CloseHandler,
    connectionHandler: WsConnection.ConnectionHandler
  );

  send(status: number, data: any): WsConnection;

  private _onConnection(
    connectionHandler: WsConnection.ConnectionHandler
  ): void;
  private _onerror(err: Error, errorHandler: WsConnection.ErrorHandler): void;
  private _onclose(
    code: number,
    reason: string,
    closeHandler: WsConnection.CloseHandler
  ): void;

  private _onmessage(
    data: WS.Data,
    messageHandler: WsConnection.MessageHandler
  ): void;
}

/*~ If you want to expose types from your module as well, you can
 *~ place them in this block.
 *~
 *~ Note that if you decide to include this namespace, the module can be
 *~ incorrectly imported as a namespace object, unless
 *~ --esModuleInterop is turned on:
 *~   import * as x from '[~THE MODULE~]'; // WRONG! DO NOT DO THIS!
 */
declare namespace WsConnection {
  export interface Message {
    url: string;
    data: any;
  }
  export type ConnectionHandler = (connection: WsConnection) => void;

  export type MessageHandler = (
    connection: WsConnection,
    data: Message
  ) => void;

  export type ErrorHandler = (connection: WsConnection, error: Error) => void;
  export type CloseHandler = (
    connection: WsConnection,
    code: number,
    reason: string
  ) => void;
}
