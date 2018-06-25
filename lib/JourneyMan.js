'use strict';

const Config             = require( './Config/Config' );
const configSchema       = require( './Config/Schemas/v1' );
const Input              = require( './Console/Input' );
const ConsoleOutput      = require( './Console/Output/ConsoleOutput' );
const Loader             = require( './Plugins/Loader' );
const fs                 = require( 'fs' );
const path               = require( 'path' );
const npm                = require( 'global-npm' );
const { promisify }      = require( 'util' );
const UnknownPluginError = require( './Errors/UnknownPluginError' );

//noinspection JSUnresolvedVariable
const loadNpm = promisify( npm.load );

/**
 * Welcome to JourneyMan!
 * This is the main class used by the CLI, but it's easy to use it programmatically. There are two
 * external requirements to Journeyman:
 *
 *  1. **A valid, physical configuration file**
 *  2. **Some kind of `process` implementation**<br>
 *     It doesn't matter if this will be the actual `process` global or a replacement object, as
 *     long as it provides the properties `argv` (the command line input), `cwd()` (function that
 *     returns the current working directory), `env` (a key-value hash that holds all environment
 *     variables).
 *
 * In order to work with Journeyman, you'll first need to create a new instance:
 *
 * ```js
 * const JourneyMan = require('journeyman');
 *
 * // note that we only need a directory here, the file
 * // resolution is performed by JourneyMan itself
 * const journeyman = new JourneyMan('/path/to/config/');
 * ```
 *
 * This will initialize the object. To kick off the actual process, you'll need to call `run()`:
 *
 * ```js
 * journeyman.run({ argv: ['foo','bar','--baz'], env: {}, cwd() {return '/'} });
 * ```
 */
class JourneyMan {

  /**
   * Static getter for the Plugin class. This provides `Plugin` to plugins without having to
   * require the actual file itself. Plugin authors are advised to use this property since the
   * path to the class might change at any time. `JourneyMan` *is* the stable API.
   *
   * @returns {Plugin}
   * @constructor
   */
  static get Plugin () {
    return require( './Plugins/Plugin' );
  }

  /**
   * Static getter for the Command class. This provides `Command` to plugins without having to
   * require the actual file itself. Plugin authors are advised to use this property since the
   * path to the class might change at any time. `JourneyMan` *is* the stable API.
   *
   * @returns {Command}
   * @constructor
   */
  static get Command () {
    return require( './Console/Command' );
  }

  /**
   * Creates a new instance of JourneyMan.
   *
   * @param {String} configFilePath Path to the configuration file.
   */
  constructor ( configFilePath = process.cwd() ) {

    /**
     * Holds Config instance for the application. Journeyman will generally first try to load
     * a file called `.journeyman`. If it is available, a new Config will be created with no
     * sub-key (`.journeyman` files are expected to only contain Journeyman configuration).
     * In case there is none, Journeyman will try to find and load a `package.json` file in
     * the current directory.
     *
     * @type {Config}
     */
    this.config = fs.existsSync( path.join( configFilePath, '.journeyman' ) )
                  ? new Config( path.join( configFilePath, '.journeyman', configSchema ) )
                  : new Config( path.join( configFilePath, 'package.json' ), 'journeyman', configSchema );

    this.plugins = [];
  }

  /**
   * Runs the application. This is kind of the *"main"* function in Journeyman, kicking off the
   * entire process chain. In order, the input is detected, plugins are loaded and the correct
   * command is routed.<br>
   * The output produced by any command than ran will be returned as the result; if anything
   * throws, it will bubble up to this point. Catching these exceptions is up to the final
   * implementation: Either a programmatic consumer or the CLI app `journ`.
   *
   * @param   {Object}     proc      Process object. While in node, `process` is a global, we want
   *                                 JourneyMan to stay as portable as possible. Therefore, process
   *                                 is a freely shimable dependency here.
   * @param   {String}     proc.argv Command line arguments
   * @param   {function}   proc.cwd  Current working directory
   * @param   {WritableStream}   proc.stdout  Standard output
   * @param   {WritableStream}   proc.stderr  Standard error output
   * @returns {Promise<*>}           Resulting output from the command
   */
  async run ( proc ) {

    /**
     * Holds the command line input.
     *
     * @type {Input}
     */
    this.input = new Input( proc.argv.slice( 2 ) );

    // Wait for the npm module to initialize
    await loadNpm();

    // Prepare the plugin loader
    this._loader = new Loader( npm );

    // Load all plugins
    this.plugins = await this._loader.discover(
      this._loader.paths.concat( this.config.paths.plugins )
    );

    const plugin = this._resolvePlugin();

    // noinspection UnnecessaryLocalVariableJS
    const result = await plugin.$run( this.input.command, {
      input:   this.input,
      output:  new ConsoleOutput( proc.stdout, proc.stderr),
      plugins: this.plugins
    } );

    return result;
  }

  /**
   * Resolves the requested plugin by looking for the given name in the plugin list.
   *
   * @returns {Plugin}
   * @private
   *
   * @throws {UnknownPluginError} If the plugin name can't be resolved.
   */
  _resolvePlugin () {
    const PluginType = this.plugins.find( plugin => plugin.name === this.input.plugin );

    if ( PluginType ) {
      return new PluginType( this );
    }

    throw new UnknownPluginError( this, this.input.plugin );
  }
}

module.exports = JourneyMan;
