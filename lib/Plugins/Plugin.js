'use strict';

/*
 * global module,
 * require
 */

const UnknownCommandError   = require( '../Errors/UnknownCommandError' );
const CommandExecutionError = require( '../Errors/CommandExecutionError' );

/**
 * @method __invoke()
 */
class Plugin {

  /**
   * Holds the plugin's subcommand name.
   *
   * @returns {String}
   */
  static get $name () {
    return this.name.replace('Plugin').toLowerCase();
  }

  /**
   * Holds all Command instances the plugin uses.
   *
   * @returns {Command[]}
   */
  static get commands () {
    return [];
  }

  /**
   * Mounts the journeyman instance on the current plugin
   *
   * @param   {JourneyMan} journeyman
   * @returns {void}
   */
  static $mount ( journeyman ) {
    this.$journeyman = journeyman;
  }

  /**
   * Runs a command on this plugin. Journeyman has figured out that this plugin is
   * required to carry out the command, so let's find a handler and try to execute it.
   *
   * @param   {String}          command Name of the command requested to run
   * @param   {Object}          context Application context for the command handler
   * @returns {Promise<String>}         A promise holding the output text
   */
  async $run ( command, context ) {
    let handler;
    let output;

    // Try __invoke first, so it can both be overwritten by more specific commands
    // and act as a catch-all solution at the same time
    if ( this.__invoke && typeof this.__invoke === 'function' ) {
      handler = this.__invoke;
    }

    // Check for explicit method handlers next. They can be overwritten by Command
    // instances which are more flexible
    if ( this[ command ] && typeof this[ command ] === 'function' ) {
      handler = this[ command ];
    }

    // Last up, iterate all registered Command instances. If any of them matches, 
    // setup the command instance and handler
    for ( let CommandHandler of this.constructor.commands ) {
      if ( CommandHandler.name === command ) {
        const instance = new CommandHandler( this );

        // configure the instance
        instance.__configure();

        // set the handler to the invoke method on the instance
        handler = instance.__invoke;

        // break the loop - we found something, no need to further iterate
        break;
      }
    }

    // We were not able to find a matching command - seems like something gone wrong
    if ( typeof handler === 'undefined' ) {
      throw new UnknownCommandError( this, command );
    }

    // We've found a handler, so let's try to execute it. The call is wrapped to 
    // prevent any uncaught exceptions inside the commands.
    try {
      output = await handler.call( this, context );
    } catch ( error ) {
      throw new CommandExecutionError( this, handler, error );
    }

    return output;
  }
}

module.exports = Plugin;
