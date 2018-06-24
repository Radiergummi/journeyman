'use strict';

const fs                     = require( 'fs' );
const util                   = require( 'util' );
const writeFile              = util.promisify( fs.writeFile );
const Schema                 = require( './Schema' );
const InvalidConfigFileError = require( '../Errors/InvalidConfigFileError' );
const ConfigUpdateError      = require( '../Errors/ConfigUpdateError' );

/**
 * #### Configuration storage class
 * Config presents a wrapper around a physical JSON file. It parses the file on
 * construction and sets any properties on itself, accessed via getters and setters.<br>
 * So basically you get a simple object with ordinary (looking) properties you can get
 * or set, but under the hood, each modified property will be written back to the config
 * file asynchronously. This is necessary for commands like `config set <val>` to work.<br>
 *
 * To retain a valid and type-safe (as far as JS allows) configuration file, there is
 * a pretty elaborate feature in place: *Schema validation*. This means that a schema is
 * in place, describing the available options and their possible values. Every time the
 * configuration is read, the data will be validated against that schema to make sure it
 * is a working configuration.
 *
 * Additionally, all property changes are validated against the Schema in place. Before
 * an option is persisted to the configuration file, it will be validated. If it passes
 * the schema checks, changes will be written, otherwise, it will throw.
 *
 * @see Schema
 */
class Config {

  /**
   * Creates a new configuration and requires the file.
   *
   * @param {String} path        Path to the file to use
   * @param {String} [configKey] Optional sub-key in the file
   * @param {Object} [schema]    Schema to validate the config with
   */
  constructor ( path, configKey = null, schema = {} ) {

    /**
     * Holds the path to the config file.
     *
     * @type {String}
     * @private
     */
    this._path = path;

    /**
     * Holds the validation schema.
     *
     * @type {Schema}
     * @private
     */
    this._schema = new Schema( schema );

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

        // Make the Config instance iterable
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
   * #### Configuration initialization
   * Populates the config file with all default values. What this will do is actually just
   * an alias for the private `_update()` method that takes the plain data and writes it to
   * the given config file path asynchronously.<br>
   * Things start to get more interesting once we connect the dots though: The `Config` is
   * inherently tied to the `Schema` it uses. If we run on the vanilla configuration here,
   * that is, there are just no fields set, the available data only consists of default
   * values. So at that point, we've got a valid (default) configuration in memory but not
   * in our file.<br>
   * Usually, that's fine, that's what defaults are there for. But considering users might
   * want to configure Journeyman, we can spare them the hassle of researching every single
   * available option by simply dumping that memory config into the file they presented to
   * us, to be modified by them.<br>
   * So this is what this method does: Write the current configuration (assumed to be empty)
   * into the configuration file.
   *
   * @returns {Promise<void>}
   */
  initialize () {
    return this._update();
  }

  /**
   * Custom inspect handler to hide private (irrelevant) fields. This really just returns
   * all config fields and removes the private methods used to make it work.
   *
   * @returns {Object}
   * @ignore
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
