export as namespace LowLevel;

export = LowLevel;

import Router from "./router";
import { Server } from "http";
import WS from "ws";
import WsConnection from "./WsConnection";

/*~ Write your module's methods and properties in this class */
declare class LowLevel {
  ws: WS.Server;
  private _connections: WsConnection[];
  get getConnections(): WsConnection[];

  private _injections: any[];
  get getInjections(): any[];

  constructor();

  initLL(server: Server): this;

  sendAll(status: number, data: any): this;

  sendTo(uuid: string, status: number, data: any): this;

  inject(anything: any): this;

  _onMessage(_: WsConnection, { data, url }: WsConnection.Message): void;

  _onError(_: WsConnection, error: Error): void;

  _onClose(connection: WsConnection, code: number, reason: string): void;

  private _onConnection(connection: WsConnection): void;

  private _removeConnection(connection: WsConnection): void;

  private _addConnection(connection: WsConnection): void;

  private handleConnection(socket: WS): void;

  static Router(base: string): Router;
}

declare namespace LowLevel {}
