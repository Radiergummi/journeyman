'use strict';

const Input  = require( './Console/Input' );
const Config = require( './Config/Config' );
const fs     = require( 'fs' );
const path   = require( 'path' );

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
   * @param {Object}   proc           Process object. While in node, `process` is a global, we want
   *                                  JourneyMan to stay as portable as possible. Therefore, process
   *                                  is a freely shimable dependency here.
   * @param {String}   proc.argv      Command line arguments
   * @param {function} proc.cwd       Current working directory
   * @param {String}   configFilePath Path to the configuration file. Defaults to the package.json
   */
  constructor ( proc, configFilePath = proc.cwd() ) {

    /**
     * Holds the command line input
     *
     * @type {Input}
     */
    this.input = new Input( proc.argv );
    this.config = fs.existsSync( path.join( configFilePath, '.journeyman' ) )
                  ? new Config( path.join( configFilePath, '.journeyman' ) )
                  : new Config( path.join( configFilePath, 'package.json' ), 'journeyman' );
  }
}

module.exports = JourneyMan;
