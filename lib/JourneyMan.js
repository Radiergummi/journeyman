'use strict';

const Input  = require( './Console/Input' );
const Config = require( './Config/Config' );
const fs     = require( 'fs' );

/**
 * Welcome to JourneyMan!
 *
 * Command Handling
 * ================
 * Command handling is a waterfall process:
 *  1. JourneyMan handles the primary process call ("journ <cmd>") and bootstraps all plugins.
 *     It then resolves the <cmd> part to a plugin.
 *  2. The plugin receives the command part ("<cmd> <sub-cmd>") and resolves it to a method call.
 *  3. The method
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
   * @param {Object}   proc           Process object. While in node, `process` is a global, we want
   *                                  JourneyMan to stay as portable as possible. Therefore, process
   *                                  is a freely shimable dependency here.
   * @param {String}   proc.argv      Command line arguments
   * @param {function} proc.cwd       Current working directory
   * @param {String}   configFilePath Path to the configuration file. Defaults to the package.json
   */
  constructor ( proc, configFilePath = proc.cwd() ) {
    this.input  = new Input( proc.argv );
    this.config = fs.existsSync( path.join( configFilePath, '.journeyman' ) )
                  ? new Config( path.join( configFilePath, '.journeyman' ) )
                  : new Config( path.join( configFilePath, 'package.json' ), 'journeyman' );
  }
}

module.exports = JourneyMan;
