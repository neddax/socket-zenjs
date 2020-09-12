import querystring from "querystring";
import WsConnection from "./WsConnection";

export interface SocketServerRequest extends Message {
  query: querystring.ParsedUrlQuery;
}

export type SocketServerMessageHandler = (
  connection: WsConnection,
  request: SocketServerRequest
) => void;

export type MessageHandler = (connection: WsConnection, data: Message) => void;
export type ErrorHandler = (connection: WsConnection, error: Error) => void;
export type CloseHandler = (
  connection: WsConnection,
  code: number,
  reason: string
) => void;

export interface Message {
  url: string;
  data: any;
}
