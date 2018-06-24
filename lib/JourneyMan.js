'use strict';

const Config             = require( './Config/Config' );
const configSchema       = require( './Config/Schemas/v1' );
const Input              = require( './Console/Input' );
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
 * This is the main class used by the CLI, but it's easy to use it programmatically.
 */
class JourneyMan {

  /**
   * Static getter for the plugin class
   * @returns {Plugin}
   * @constructor
   */
  static get Plugin () {
    return require( './Plugins/Plugin' );
  }

  /**
   * Static getter for the command class
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
   * Runs the application
   *
   * @param   {Object}     proc      Process object. While in node, `process` is a global, we want
   *                                 JourneyMan to stay as portable as possible. Therefore, process
   *                                 is a freely shimable dependency here.
   * @param   {String}     proc.argv Command line arguments
   * @param   {function}   proc.cwd  Current working directory
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
