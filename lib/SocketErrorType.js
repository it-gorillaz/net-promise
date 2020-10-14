'use strict';

const SocketErrorType = Object.freeze({
  TIMEOUT:            "TIMEOUT",
  CONNECTION_CLOSED:  "CONNECTION_CLOSED",
  TRANSMISSION_ERROR: "TRANSMISSION_ERROR",
  CONNECTION_REFUSED: "CONNECTION_REFUSED"
});

module.exports = { SocketErrorType };