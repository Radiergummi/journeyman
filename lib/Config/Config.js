'use strict';

const fs                     = require( 'fs' );
const util                   = require( 'util' );
const writeFile              = util.promisify( fs.writeFile );
const Schema                 = require( './Schema' );
const InvalidConfigFileError = require( '../Errors/InvalidConfigFileError' );
const ConfigUpdateError      = require( '../Errors/ConfigUpdateError' );

/**
 * Configuration storage class
 * Config presents a wrapper around a physical JSON file. It parses the file on
 * construction and sets any properties on itself, accessed via getters and setters.
 * If a key is modified, the change will be written to disk asynchronously.
 * Configuration data is validated against the Schema.
 */
class Config {

  /**
   * Creates a new configuration and requires the file.
   *
   * @param {String} path        Path to the file to use
   * @param {String} [configKey] Optional sub-key in the file
   */
  constructor ( path, configKey = null ) {
    this._path   = path;
    this._schema = new Schema();

    try {

      // Load the data
      this._raw      = require( path );
      this._accessor = configKey;

      // Validate it
      this._data = this._schema.validate( this._data );
    } catch ( error ) {
      throw new InvalidConfigFileError( this._path, error );
    }

    // Iterate all keys in the configuration
    for ( let key of Object.keys( this._data ) ) {

      // Create a reactive property on the Config instance
      Object.defineProperty( this, key, {
        get () {

          // We *could* read each time here to achieve a live config file.
          return this._get( key );
        },

        set ( value ) {
          return this._set( key, value );
        },

        enumerable: true
      } );
    }
  }

  /**
   * Proxy to the actual data object using the accessor key.
   *
   * @returns {Object} Config data
   * @private
   */
  get _data () {
    return this._accessor
           ? this._raw[ this._accessor ]
           : this._raw;
  }

  /**
   * Proxy setter for the actual data object using the accessor key.
   *
   * @param   {Object} value New config data
   * @returns {void}
   * @private
   */
  set _data ( value ) {
    if ( this._accessor ) {
      this._raw[ this._accessor ] = value;
    } else {
      this._raw = value;
    }
  }

  /**
   * Sets a key in the config data.
   *
   * @param   {String}        key   Key to set
   * @param   {*}             value Value to set
   * @returns {Promise<void>}
   * @private
   */
  _set ( key, value ) {
    this._data[ key ] = this._schema.validateField( key, value );

    return this._update();
  }

  /**
   * Retrieves a value from the config data.
   *
   * @param   {String} key Key to retrieve
   * @returns {*}
   * @private
   */
  _get ( key ) {
    return this._data[ key ];
  }

  /**
   * Updates the configuration file.
   *
   * @returns {Promise<void>}
   * @private
   */
  async _update () {
    try {
      await writeFile( this._path, JSON.stringify( this._raw, null, 4 ) );
    } catch ( error ) {
      throw new ConfigUpdateError( this._path, error );
    }
  }

  /**
   * Populates the config file with all default values.
   *
   * @returns {Promise<void>}
   */
  async initialize () {
    return this._update();
  }

  /**
   * Custom inspect handler to hide private (irrelevant) fields
   *
   * @returns {Object}
   */
  [ util.inspect.custom ] () {
    const data = {};

    for ( let [ key, value ] of Object.entries( this ) ) {
      if ( !key.startsWith( '_' ) ) {
        data[ key ] = value;
      }
    }

    return data;
  }
}

module.exports = Config;
