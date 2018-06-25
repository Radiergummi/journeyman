'use strict';

/*
 * global module,
 * require
 */

const UnknownCommandError   = require( '../Errors/UnknownCommandError' );
const CommandExecutionError = require( '../Errors/CommandExecutionError' );
const MethodCommand         = require( '../Console/Commands/MethodCommand' );

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
    return this.name.replace( 'Plugin' ).toLowerCase();
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
   * @param {JourneyMan} journeyman
   */
  constructor ( journeyman ) {
    this.$journeyman = journeyman;
  }

  /**
   * Runs a command on this plugin. Journeyman has figured out that this plugin is
   * required to carry out the command, so let's find a handler and try to execute it.
   *
   * @param   {String}                           command Name of the command requested to run
   * @param   {{ input: Input, output: Output }} context Application context for the command handler
   * @returns {Promise<String>}                          A promise holding the output text
   */
  async $run ( command, context ) {
    let handler;
    let output;

    // Try __invoke first, so it can both be overwritten by more specific commands
    // and act as a catch-all solution at the same time
    if ( typeof this.__invoke === 'function' ) {
      handler = new MethodCommand( this, command, this.__invoke );
    }

    // Check for explicit method handlers next. They can be overwritten by Command
    // instances which are more flexible
    if ( command && command.charAt( 0 ) !== '_' && typeof this[ command ] === 'function' ) {
      handler = new MethodCommand( this, command, this[ command ] );
    }

    // Last up, iterate all registered Command instances. If any of them matches,
    // setup the command instance and handler
    for ( let CommandHandler of this.constructor.commands ) {
      if ( CommandHandler.name === command ) {
        handler = new CommandHandler( this );

        // Break the loop - we found something, no need to further iterate
        break;
      }
    }

    // We were not able to find a matching command - seems like something gone wrong
    if ( typeof handler === 'undefined' ) {
      throw new UnknownCommandError( this, command );
    }

    // Configure the handler
    handler.__configure();

    // If the command has input definitions available, validate them now
    if ( handler.definesInput() ) {
      context.input.validate( handler );
    }

    // We've found a handler, so let's try to execute it. The call is wrapped to
    // prevent any uncaught exceptions inside the commands.
    try {
      output = await handler.__invoke( context );
    } catch ( error ) {
      throw new CommandExecutionError( this, handler, error );
    }

    context.output.flush();

    return output;
  }
}

module.exports = Plugin;
