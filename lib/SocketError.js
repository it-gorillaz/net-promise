'use strict';

class SocketError extends Error {
  
  constructor(error, type) {
    super(error);
    this.type = type
  }

}

module.exports = { SocketError };