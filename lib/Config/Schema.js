'use strict';

const util                              = require( 'util' );
const ConfigValidationError             = require( '../Errors/ConfigValidationError' );
const ConfigValidationTypeError         = require( '../Errors/ConfigValidationTypeError' );
const ConfigValidationMissingFieldError = require( '../Errors/ConfigValidationMissingFieldError' );
const ConfigValidationValidatorError    = require( '../Errors/ConfigValidationValidatorError' );
const ConfigValidationInvalidFieldError = require( '../Errors/ConfigValidationInvalidFieldError' );

class Schema {

  /**
   * Holds the current schema version. Through this mechanism, it's possible to
   * create new versions and use them instead.
   *
   * @returns {Number}
   * @constructor
   */
  static get VERSION () {
    return 1;
  }

  constructor () {

    /**
     * Holds the fields the schema describes.
     *
     * @returns {Object}
     */
    this.fields = {
      preferred_spelling: {
        type:     String,
        required: false,
        default:  'camel',
        validator ( spelling ) {
          return spelling === 'camel' || spelling === 'kebab';
        }
      },

      paths: {
        type:     Object,
        required: false,
        default:  {
          assets:     './src/assets',
          components: './src/components',
          mixins:     './src/mixins',
          modules:    './src/modules',
          router:     './src/router',
          styles:     './src/styles',
          build:      './build',
          config:     './config',
          public:     './public',
          static:     './static'
        },
        validator ( paths ) {
          const keys         = Object.keys( paths );
          const requiredKeys = Object.keys( this.default );

          if ( keys.length !== requiredKeys.length ) {
            return false;
          }

          for ( let key of requiredKeys ) {
            if ( !keys.includes( key ) ) {
              return false;
            }
          }

          return true;
        }
      }
    };
  }

  /**
   * Creates an empty, default schema to be used inside the Config.init method
   *
   * @returns {Object}
   */
  toJSON () {
    const config = {};

    for ( let [ field, meta ] of Object.entries( this.fields ) ) {
      config[ field ] = meta.default;
    }

    return config;
  }

  /**
   * Validates a given object against the schema
   *
   * @param   {Object} obj object to validate
   * @returns {Object}     validated and merged config
   */
  validate ( obj ) {

    // check if there is configuration data at all - otherwise, return defaults
    if ( typeof obj === 'undefined' ) {
      return this.toJSON();
    }

    // check for unsupported types
    if ( typeof obj !== 'object' ) {
      throw new ConfigValidationError( this, obj );
    }

    const mergedConfig = {};

    // validate each config field
    for ( let field of Object.keys( this.fields ) ) {

      // check if the object has the current field
      if ( !obj.hasOwnProperty( field ) ) {

        // if the field is required, bail
        if ( this.fields[ field ].required === true ) {
          throw new ConfigValidationMissingFieldError( this, obj, field );
        }

        // otherwise, set the field to it's default
        mergedConfig[ field ] = this.fields[ field ].default;
      } else {
        mergedConfig[ field ] = this.validateField( field, obj[ field ] );
      }
    }

    return mergedConfig;
  }

  /**
   * Validates a single field.
   *
   * @param   {String} field Name of the field to validate
   * @param   {*}      value Field value
   * @returns {*}            Field value, pass-through
   *
   * @throws ConfigValidationInvalidFieldError If the field is unknown
   * @throws ConfigValidationTypeError         If the values type doesn't match the requirements
   * @throws ConfigValidationValidatorError    If the field validator can't validate the field
   */
  validateField ( field, value ) {
    if ( !this.fields.hasOwnProperty( field ) ) {
      throw new ConfigValidationInvalidFieldError( this, field, value );
    }

    const meta = this.fields[ field ];

    // switch on the required field type
    switch ( meta.type ) {
      case String:
        if ( typeof value !== 'string' ) {
          throw new ConfigValidationTypeError( this, field, value, meta );
        }
        break;

      case Number:
        if ( isNaN( value ) ) {
          throw new ConfigValidationTypeError( this, field, value, meta );
        }
        break;

      case Boolean:
        if ( typeof value !== 'boolean' ) {
          throw new ConfigValidationTypeError( this, field, value, meta );
        }
        break;

      case Array:
        if ( !Array.isArray( value ) ) {
          throw new ConfigValidationTypeError( this, field, value, meta );
        }
        break;

      case Symbol:
        if ( typeof value !== 'symbol' ) {
          throw new ConfigValidationTypeError( this, field, value, meta );
        }
        break;

      case Object:
        if ( typeof value !== 'object' || Array.isArray( value ) || value === null ) {
          throw new ConfigValidationTypeError( this, field, value, meta );
        }
        break;

      // if the type is neither a primitive nor an Array or an object, just use instanceof
      default:
        if ( !( value instanceof meta.type ) ) {
          throw new ConfigValidationTypeError( this, field, value, meta );
        }
    }

    // run the field through the validator, if present
    if ( typeof meta.validator === 'function' && !meta.validator( value ) ) {
      throw new ConfigValidationValidatorError( this, field, value, meta );
    }

    return value;
  }

  /**
   * Custom inspect handler to include the version
   *
   * @returns {{version: Number, fields: Object}}
   */
  [ util.inspect.custom ] () {
    return {
      version: this.constructor.VERSION,
      fields:  this.fields
    };
  }
}

module.exports = Schema;
