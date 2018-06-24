'use strict';

const util                              = require( 'util' );
const ConfigValidationError             = require( '../Errors/ConfigValidationError' );
const ConfigValidationTypeError         = require( '../Errors/ConfigValidationTypeError' );
const ConfigValidationMissingFieldError = require( '../Errors/ConfigValidationMissingFieldError' );
const ConfigValidationValidatorError    = require( '../Errors/ConfigValidationValidatorError' );
const ConfigValidationInvalidFieldError = require( '../Errors/ConfigValidationInvalidFieldError' );

/**
 * #### Configuration Schema
 * The Schema class provides a dynamic validator for object schemas. By passing a set of rules, the
 * schema can validate an entire object or single fields against these rules. This enables both
 * prop checking as well as type checking.
 * Rule sets must be an object structured like this:
 *
 * ```js
 * const rules = {
 *
 *   // All keys must be named like the fields to validate, so this rule for example would match
 *   // a field called "fieldName".
 *   fieldName: { // All rules for "fieldName" will be contained within this object.
 *
 *     // The mandatory type rule allows to check the field against a type constructor
 *     type: String, // Or any other valid constructor like Boolean, Array, Number, etc.
 *                   // You can also pass an arbitrary prototype the field will be checked
 *                   // against using instanceof.
 *
 *     // Whether the field is required (eg. must be present).
 *     required: false, // Or true - no default required in that case.
 *
 *     // If required is set to false, pass a default value here.
 *     default: 'foo', // Defaults will be returned if the field is undefined.
 *
 *     // Validators allow for custom field validations. They will only run if the type check
 *     // matches, so remember to take care of both.
 *     // Validator callbacks must be synchronous functions that return a boolean.
 *     validator(value) {
 *       return [ 'foo', 'bar', 'baz' ].includes( value );
 *     }
 *   }
 * }
 * ```
 *
 * After setting up the rules, you can use two validation methods:
 *
 * 1. **`schema.validate( myDataObject: Object ): Object`**
 * Validates each property of the object, that is: It runs `validateField` on each of them. If
 * the object is invalid, one of the checks will throw (so remember to try-catch), if it is
 * valid, it will return the passed object with any eventually missing fields monkey-patched to
 * their defaults, if their rules provide one.
 *
 * 2. **`schema.validateField( key: String, value: Any ): Any`**
 * Validates a single field by rule name. The `key` parameter will be used to check the `value`
 * against the appropriate rule. If the value is invalid, one of the checks will throw (when
 * using the `validate` method, this is what bubbles up), if it is valid, the value will be
 * returned. If there was no value and the field was optional, the default will be returned if
 * it is available.
 */
class Schema {

  /**
   * Creates a new schema using the given rule set.
   *
   * @param {Object} rules A set of rules to create the schema for.
   */
  constructor ( rules ) {

    /**
     * Holds the rules the schema describes. Each rule consists of the
     * following properties:
     *  - **`type: Function`:** Any other valid constructor like Boolean, Array, Number, etc.
     *                          You can also pass an arbitrary prototype the field will be
     *                          checked against using instanceof.
     *    The mandatory type rule allows to check the field against a type constructor.
     *  - **`required: Boolean`:** Whether the field is required (eg. must be present).
     *  - **`default: Any`:** If required is set to false, pass a default value here.
     *                        Defaults will be returned if the field is `undefined`.
     *  - **`validator: function(Any): Any`:** Validators allow for custom field validations.
     *                                         They will only run if the type check
     *                                         matches, so remember to take care of both.
     *                                         Validator callbacks must be synchronous
     *                                         functions that return a boolean.
     *
     * @returns {Object<{type: Function, required?: Boolean, default?: *, validator?: Function}>}
     */
    this.rules = rules;
  }

  /**
   * Creates an empty, default schema holding all defaults.
   *
   * @returns {Object}
   */
  toJSON () {
    const config = {};

    for ( let [ field, rule ] of Object.entries( this.rules ) ) {
      config[ field ] = rule.default;
    }

    return config;
  }

  /**
   * #### Configuration object validation
   * Validates a given object against the schema. This works by running each field through
   * `validateField` individually. If a field is missing but defined in the schema, and that
   * field is flagged as required, it will throw, otherwise it will be set to it's default
   * value and further checking is omitted (since defaults are inherently trusted).
   *
   * @param   {Object} [obj] Object to validate. This will probably be the data read from the config
   *                         file.
   * @returns {Object}       Validated and merged config. This output object contains **all** keys
   *                         the schema defines - if any had been missing from the object, they
   *                         exist with their defaults as values now.
   *
   * @throws {ConfigValidationError}             If an invalid (non-object) parameter has been passed
   * @throws {ConfigValidationMissingFieldError} If a required field is missing
   * @throws {ConfigValidationInvalidFieldError} If a field is unknown
   * @throws {ConfigValidationTypeError}         If a values type doesn't match the requirements
   * @throws {ConfigValidationValidatorError}    If a field validator can't validate a field
   */
  validate ( obj ) {

    // check if there is configuration data at all - otherwise, return defaults
    if ( typeof obj === 'undefined' ) {
      return this.toJSON();
    }

    // check for unsupported types
    if ( typeof obj !== 'object' || Array.isArray( obj ) || obj === null ) {
      throw new ConfigValidationError( this, obj );
    }

    const mergedConfig = {};

    // validate each schema rule
    for ( let field of Object.keys( this.rules ) ) {

      // check if the object has the current field
      if ( !obj.hasOwnProperty( field ) ) {

        // if the field is required, bail
        if ( this.rules[ field ].required === true ) {
          throw new ConfigValidationMissingFieldError( this, obj, field );
        }

        // otherwise, set the field to it's default
        mergedConfig[ field ] = this.rules[ field ].default;
      } else {
        mergedConfig[ field ] = this.validateField( field, obj[ field ] );
      }
    }

    return mergedConfig;
  }

  /**
   * Validates a single field.
   * The validation process is split into several checks, ordered by probability of them occurring.
   * Each check will throw a specific error if it fails.
   *
   *  1. Check if a rule for the field is available
   *  2. Check if the type matches the rule. This is a bit of work since there is a specific
   *     check for each type:
   *     1. **`String`** - checked using `typeof`
   *     2. **`Number`** - checked using `isNaN` and a `null` check
   *     3. **`Boolean`** - checked using `typeof`
   *     4. **`Array`** - checked using `Array.isArray`
   *     5. **`Symbol`** - checked using `typeof`
   *     6. **`Object`** -  checked using `typeof`, then `Array.isArray` and a `null` check.
   *        The object will then be merged with the rule's default, if any.
   *     7. **Anything else** - checked using `instanceof`
   *
   *  3. Check if the validator callback (if any) can validate the field (returns `true`)
   *
   * If all these checks pass, the value will be returned.
   *
   * @param   {String} field Name of the field to validate
   * @param   {*}      value Field value
   * @returns {*}            Field value, pass-through
   *
   * @throws {ConfigValidationInvalidFieldError} If the field is unknown
   * @throws {ConfigValidationTypeError}         If the values type doesn't match the requirements
   * @throws {ConfigValidationValidatorError}    If the field validator can't validate the field
   */
  validateField ( field, value ) {

    // Check if the field is known
    if ( !this.rules.hasOwnProperty( field ) ) {
      throw new ConfigValidationInvalidFieldError( this, field, value );
    }

    const rule = this.rules[ field ];

    // switch on the required field type
    switch ( rule.type ) {
      case String:
        if ( typeof value !== 'string' ) {
          throw new ConfigValidationTypeError( this, field, value, rule );
        }
        break;

      case Number:
        if ( value === null || isNaN( value ) ) {
          throw new ConfigValidationTypeError( this, field, value, rule );
        }
        break;

      case Boolean:
        if ( typeof value !== 'boolean' ) {
          throw new ConfigValidationTypeError( this, field, value, rule );
        }
        break;

      case Array:
        if ( !Array.isArray( value ) ) {
          throw new ConfigValidationTypeError( this, field, value, rule );
        }
        break;

      case Symbol:
        if ( typeof value !== 'symbol' ) {
          throw new ConfigValidationTypeError( this, field, value, rule );
        }
        break;

      case Object:
        if ( typeof value !== 'object' || Array.isArray( value ) || value === null ) {
          throw new ConfigValidationTypeError( this, field, value, rule );
        }

        if ( rule.default ) {

          // assign any missing defaults
          value = Object.assign( rule.default, value );
        }
        break;

      // if the type is neither a primitive nor an Array or an object, just use instanceof
      default:
        if ( !( value instanceof rule.type ) ) {
          throw new ConfigValidationTypeError( this, field, value, rule );
        }
    }

    // run the field through the validator, if present
    if ( typeof rule.validator === 'function' ) {
      let validatorResult;

      try {
        validatorResult = rule.validator( value );
      } catch ( error ) {
        throw new ConfigValidationValidatorError( this, field, value, rule );
      }

      if ( validatorResult === false ) {
        throw new ConfigValidationValidatorError( this, field, value, rule );
      }
    }

    return value;
  }

  /**
   * Custom inspect handler
   *
   * @returns {Object}
   * @ignore
   */
  [ util.inspect.custom ] () {
    return this.rules;
  }
}

module.exports = Schema;
