'use strict';

/*
 * global module,
 * require
 */

const CommandArgument           = require( './Commands/CommandArgument' );
const CommandOption             = require( './Commands/CommandOption' );
const Plugin                    = require( '../Plugins/Plugin' );
const InvalidInstantiationError = require( '../Errors/InvalidInstantiationError' );

/**
 * #### Console Command
 * Commands represent complete, CLI-callable commands.
 */
class Command {

  /**
   * Holds the name of the command.
   */
  static get $name () {
    return '';
  }

  /**
   * Creates a new command instance.
   *
   * @param {Plugin} plugin
   */
  constructor ( plugin ) {
    this.$plugin = plugin;

    /**
     * Holds the current command name
     *
     * @type {String}
     * @private
     */
    this._name = this.constructor.$name;

    /**
     * Holds the description for the current command
     *
     * @type {String}
     * @private
     */
    this._description = null;

    /**
     * Holds the usage information for the current command
     *
     * @type {String}
     * @private
     */
    this._usage = null;

    /**
     * Holds all argument definitions for the current command
     *
     * @type {CommandArgument[]}
     * @private
     */
    this.arguments = [];

    /**
     * Holds all option definitions for the current command
     *
     * @type {CommandOption[]}
     * @private
     */
    this.options = [];

    this.addOption( 'help', 'h', CommandOption.OPTIONAL | CommandOption.VALUE_NONE, 'Shows the command help' );
  }

  /**
   * Retrieves the command name
   *
   * @return {string}
   */
  getName () {
    return this._name;
  }

  setName ( value ) {
    this._name = value;
  }

  getDescription () {
    return this._description;
  }

  setDescription ( value ) {
    this._description = value;
  }

  getUsage () {
    if ( !this._usage ) {
      let usage = this.getName() + this._arguments.reduce( ( str, argument ) => ` ${argument.help}`, '' );

      // if we have fewer than 6 options, we'll print out each of them
      if ( this._options.length < 6 ) {
        const options = this._options.map(
          option => option.type === CommandOption.types.value_required
                    ? option.help
                    : `[${option.help}]`
        );

        usage += ` ${options.join( '' )}`;
      } else {

        // otherwise, show the [options] placeholder
        usage += ' [options]';
      }

      usage += '\n\n';

      const maximumOptionHelpLength = this._options.reduce( ( max, option ) => {
        const helpLength = option.help.length;

        return max > helpLength ? max : helpLength;
      }, 0 );

      this._options.forEach( option => {
        usage += `\n  ${option.help.padEnd( maximumOptionHelpLength )} ${option.description}`;
      } );

      usage += '\n';

      return usage;
    }

    return this._usage;
  }

  setUsage ( value ) {
    this._usage = value;
  }

  /**
   * #### Command configuration
   * Using the `__configure()` method, you can efficiently define the required syntax for your command.<br>
   * If you're familiar with Symfony Console, this will make sense to you immediately. Otherwise,
   * continue reading.
   *
   *
   *
   * @returns {void}
   */
  __configure () {
  }

  // noinspection JSMethodCanBeStatic
  /**
   * Executes the command. All commands should return a Promise, even though it isn't strictly
   * necessary since you can `await` non-Promise returning functions too.
   *
   * @returns {Promise<String|Number>|*}
   */
  __invoke ( context ) {
    return Promise.resolve( null );
  }

  /**
   * Retrieves the help text
   * @param input
   * @param output
   */
  getHelp ( input, output ) {
    output.standardOutput.writeLine( 'Usage:' );
    this.getUsage().split( '\n' ).forEach( line => output.standardOutput.writeLine( line ) );
    output.standardOutput.writeLine( '' );

    if ( this.getDescription() ) {
      output.standardOutput.writeLine( 'Description:' );
      output.standardOutput.writeLine( this.getDescription() );
    }

    output.standardOutput.writeLine( '' );
  }

  /**
   * Adds a new argument to the command. Please make sure that you add all your arguments in
   * the desired order - arguments provide no clues aside from their position as to which one
   * it is, so Journeyman's input component will silently assign them in the order of
   * appearance.
   *
   * @param {String} name          argument name
   * @param {Number} [flags]       argument type. must use one of the static types (@see CommandArgument#types)
   * @param {String} [description] argument description for the help text
   * @param {*}      [fallback]    fallback value if missing. Can only be used for optional arguments
   */
  addArgument (
    name,
    flags       = CommandArgument.OPTIONAL,
    description = '',
    fallback    = null
  ) {
    this.arguments.push( new CommandArgument(
      name,
      flags,
      description,
      fallback
    ) );
  }

  /**
   * Adds a new option to the command
   *
   * @param {String} longName
   * @param {String} shortName
   * @param {Number} flags
   * @param {String} description
   * @param {String} valueLabel
   */
  addOption (
    longName,
    shortName   = longName.substr( 0, 1 ),
    flags       = CommandOption.OPTIONAL,
    description = '',
    valueLabel  = ''
  ) {
    if ( !this.hasOption( longName ) ) {
      this.options.push( new CommandOption(
        longName,
        shortName,
        flags,
        description,
        valueLabel
      ) );
    } else {
      const option = this.options.find( option => option.longName === longName );

      if ( option ) {
        option.longName    = longName;
        option.shortName   = shortName;
        option.flags       = flags;
        option.description = description;
        option.valueLabel  = valueLabel;
      }
    }
  }

  /**
   * Checks whether the command has an option
   *
   * @param  {string}  name long name of the option
   * @return {boolean}
   */
  hasOption ( name ) {
    return !!this.options.find( option => option.longName === name );
  }

  /**
   * Checks whether the command defines any options.
   *
   * @returns {Boolean}
   */
  hasOptions () {
    return this.options.length > 0;
  }

  /**
   * Retrieves all command options for the command.
   *
   * @returns {CommandOption[]}
   */
  getOptions () {
    return this.options;
  }

  /**
   * Checks whether the command defines any arguments.
   *
   * @returns {Boolean}
   */
  hasArguments () {
    return this.arguments.length > 0;
  }

  /**
   * Retrieves all command arguments for the command.
   *
   * @returns {CommandArgument[]}
   */
  getArguments () {
    return this.arguments;
  }

  /**
   * Checks whether the command defines any input.
   *
   * @returns {Boolean}
   */
  definesInput () {
    return this.hasOptions() || this.hasArguments();
  }
}

module.exports = Command;
