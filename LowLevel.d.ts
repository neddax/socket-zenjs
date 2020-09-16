export as namespace LowLevel;

export = LowLevel;

import Router from "./router";
import { Server } from "http";
import WS from "ws";
import ZenSocketConnection from "./ZenSocketConnection";

/*~ Write your module's methods and properties in this class */
declare class LowLevel {
  ws: WS.Server;
  private _connections: ZenSocketConnection[];
  get getConnections(): ZenSocketConnection[];

  constructor();

  initLL(server: Server): this;

  sendAll(status: number, data: any): this;

  sendTo(uuid: string, status: number, data: any): this;

  _onMessage(
    _: ZenSocketConnection,
    { data, url }: ZenSocketConnection.Message
  ): void;

  _onError(_: ZenSocketConnection, error: Error): void;

  _onClose(connection: ZenSocketConnection, code: number, reason: string): void;

  private _onConnection(connection: ZenSocketConnection): void;

  private _removeConnection(connection: ZenSocketConnection): void;

  private _addConnection(connection: ZenSocketConnection): void;

  private handleConnection(socket: WS): void;

  static Router(base: string): Router;
}

declare namespace LowLevel {}
