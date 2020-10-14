'use strict';

const net = require("net"),
      { EOL } = require("os"),
      { SocketError } = require("./SocketError"),
      { 
        TIMEOUT, 
        CONNECTION_CLOSED, 
        CONNECTION_REFUSED, 
        TRANSMISSION_ERROR 
      } = require("./SocketErrorType").SocketErrorType;

const READY_EVENT   = "ready",
      DATA_EVENT    = "data",
      TIMEOUT_EVENT = "timeout",
      CLOSE_EVENT   = "close",
      ERROR_EVENT   = "error";

const NO_IDLE_TIMEOUT = 0;

const ERROR_ON_READ      = "Error while awaiting message from remote host",
      ERROR_ON_WRITE     = "Error while sending message to remote host",
      IDLE_TIMEOUT_ERROR = "Connection timed out while awaiting message from remote host";

const onIdleTimeout = (reject, message) => () => reject(new SocketError(message, TIMEOUT));

const onConnectionClosed = (reject, message) => 
  (hadError) => reject(
    new SocketError(
      message, 
      hadError 
        ? TRANSMISSION_ERROR 
        : CONNECTION_CLOSED
    )
  );

const onDataReceived = resolve => {
  const messages = [];
  return data => {
    const message = data.toString();
    messages.push(message);
    if (EOL === message.slice(-1)) {
      resolve(messages.join(""))
    }
  }
}

const onWrite = (resolve, reject) => 
  error => error 
    ? reject(new SocketError(error, TRANSMISSION_ERROR)) 
    : resolve(null);

const Socket = ({ host, port, timeout = NO_IDLE_TIMEOUT }, dataHandler = onDataReceived) => {

  const socket = net.createConnection(port, host);
  socket.setTimeout(timeout);

  const methods = Object.freeze({

    write: message => new Promise((resolve, reject) => {
      const errorHandler = onConnectionClosed(reject, ERROR_ON_WRITE);
      const writeHandler = onWrite(resolve, reject);      
      socket.removeAllListeners(DATA_EVENT);      
      socket.once(CLOSE_EVENT, errorHandler);
      socket.write(message, writeHandler);
    }),

    recv: () => new Promise((resolve, reject) => {
      const timeoutHandler = onIdleTimeout(reject, IDLE_TIMEOUT_ERROR);
      const errorHandler = onConnectionClosed(reject, ERROR_ON_READ);      
      const messageHandler = dataHandler(resolve);      
      socket.once(TIMEOUT_EVENT, timeoutHandler);
      socket.once(CLOSE_EVENT, errorHandler);
      socket.on(DATA_EVENT, messageHandler);
    }),

    close: () => socket.destroy()

  });

  return new Promise((resolve, reject) => {
    socket.once(ERROR_EVENT, (e) => reject(new SocketError(e, CONNECTION_REFUSED)));
    socket.once(READY_EVENT, () => resolve(methods));
  });

};

module.exports = { Socket };