'use strict';

const path                 = require( 'path' );
const fs                   = require( 'fs' );
const util                 = require( 'util' );
const readDir              = util.promisify( fs.readdir );
const Plugin               = require( './Plugin' );
const PluginLoadError      = require( '../Errors/PluginLoadError' );
const PluginDiscoveryError = require( '../Errors/PluginDiscoveryError' );
const InvalidPluginError   = require( '../Errors/InvalidPluginError' );

class Loader {

  /**
   * Holds plugin validation rules
   *
   * @returns {{name: (function(String): Boolean), isPlugin: (function(Object): boolean)}}
   */
  static get rules () {
    return {

      /**
       * Checks whether the module name matches a journeyman plugin
       *
       * @param   {String}  module
       * @returns {Boolean}
       */
      name: module => !!module.match( /^journeyman-plugin-(.+)/ ),

      /**
       * Checks whether the module is an instance of the plugin base class
       *
       * @param   {Object}  plugin
       * @returns {Boolean}
       */
      isPlugin: plugin => plugin instanceof Plugin
    };
  }

  /**
   * Creates a new loader
   */
  constructor () {
    this.plugins = [];
  }

  /**
   * Discovers plugins in one or more specific search paths
   *
   * @param   {Array|String}   searchPaths
   * @returns {Promise<Array>}
   */
  discover ( searchPaths = [] ) {
    if ( typeof searchPaths === 'string' ) {
      return this._discoverPath( searchPaths );
    }

    if ( Array.isArray( searchPaths ) ) {
      return Promise.all( searchPaths.map(
        searchPath => this._discoverPath( searchPath )
      ) );
    }
  }

  /**
   * Discovers plugins in a specific search path
   *
   * @param   {String} searchPath
   * @returns {Promise<Array>}
   * @private
   */
  async _discoverPath ( searchPath ) {
    let modules = [];

    // try to read the search path
    try {
      modules = await readDir( searchPath );
    } catch ( error ) {
      throw new PluginDiscoveryError( this, searchPath, error );
    }

    // iterate all module directories found
    for ( let moduleName of modules ) {

      // check if the module name matches
      if ( this.constructor.rules.name( moduleName ) ) {

        // resolve the plugin path
        const modulePath = path.resolve( path.join( searchPath, moduleName ) );

        let plugin;

        // try to require the plugin
        try {
          plugin = require( modulePath );
        } catch ( error ) {
          throw new PluginLoadError( this, modulePath, error );
        }

        // check if it's a valid plugin
        if ( !this.constructor.rules.isPlugin( plugin ) ) {
          throw new InvalidPluginError( this, plugin );
        }

        this.plugins.push( plugin );
      }
    }

    return this.plugins;
  }
}

module.exports = Loader;
