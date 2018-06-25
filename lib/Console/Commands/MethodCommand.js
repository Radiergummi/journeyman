'use strict';

const Command = require( '../Command' );

class MethodCommand extends Command {
  constructor ( plugin, name, handler ) {
    super( plugin );
    this.setName( name );

    this._handler = handler;
  }

  __invoke ( context ) {
    return this._handler( context );
  }
}

module.exports = MethodCommand;
