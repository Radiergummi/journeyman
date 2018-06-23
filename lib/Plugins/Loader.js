'use strict';

const path                 = require( 'path' );
const fs                   = require( 'fs' );
const util                 = require( 'util' );
const readDir              = util.promisify( fs.readdir );
const exists               = util.promisify( fs.exists );
const Plugin               = require( './Plugin' );
const PluginLoadError      = require( '../Errors/PluginLoadError' );
const PluginDiscoveryError = require( '../Errors/PluginDiscoveryError' );
const InvalidPluginError   = require( '../Errors/InvalidPluginError' );

/**
 * #### Plugin loader
 * The plugin loader iterates over any directories that might contain plugins for journeyman.<br>
 * The loader itself, however, doesn't keep a static directory list but rather relies on calls to
 * the `discover()` method that accepts either single directories as strings or an array of paths.
 *
 * When called, the method reads the path's content and checks each entry against a set of rules
 * in the static `rules` property. If the path passes the rules, the directory is regarded as being
 * a Journeyman plugin and it will be loaded in the application.
 * By default, both the global node_modules directory and one in the current working directory are
 * included in the discovery - yes, this contradicts the statement on hardcoded paths, however this
 * is standard behavior not up for changes. Additionally, the loader relies on an instance of the
 * global `npm` module being passed to it's constructor which both paths are inferred from.
 */
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
   *
   * @param {Object} npm
   */
  constructor ( npm ) {
    this.plugins = [];
    this.paths   = [
      npm.dir,
      npm.globalDir
    ];
  }

  /**
   * Discovers plugins in one or more specific search paths
   *
   * @param   {Array|String}   searchPaths
   * @returns {Promise<Array>}
   */
  async discover ( searchPaths = [] ) {
    if ( typeof searchPaths === 'string' ) {
      return this._discoverPath( searchPaths );
    }

    if ( Array.isArray( searchPaths ) ) {

      const plugins = await Promise.all(
        searchPaths

        // remove invalid paths
          .filter( path => typeof path !== 'undefined' )

          // discover each path
          .map( searchPath => this._discoverPath( searchPath ) )
      );

      // merge all plugin sources
      return Array.prototype.concat( ...plugins );
    }
  }

  /**
   * Discovers plugins in a specific search path
   *
   * @param   {String} searchPath
   * @returns {Promise<Plugin[]>}
   * @private
   */
  async _discoverPath ( searchPath ) {
    let modules = [];

    // try to read the search path
    try {
      if ( await exists( searchPath ) ) {
        modules = await readDir( searchPath );
      }
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
