'use strict';

class UnknownCommandError extends Error {
  constructor(plugin, command) {
    super('Unknown command ' + command);

    this.name = this.constructor.name;
    
    this.meta = { plugin, command };

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else { 
      this.stack = (new Error(message)).stack; 
    }
  }
}

module.exports = UnknownCommandError;
