'use strict';

class CommandOption {

  /**
   * Holds the available option types
   *
   * @return {{value_none: string, value_required: string, value_optional: string}}
   */
  static get types () {
    return {
      value_none:     'none',
      value_required: 'required',
      value_optional: 'optional'
    };
  }

  static get REQUIRED () {
    return 1;
  }

  static get OPTIONAL () {
    return 2;
  }

  static get VALUE_REQUIRED () {
    return 4;
  }

  static get VALUE_NONE () {
    return 8;
  }

  /**
   * Creates a new option. All arguments but the long name are optional.
   *
   * @param {String} longName       Option name to be used as "--long-name"
   * @param {String} [shortName]    Short name to be used as "-s". will be automatically generated if omitted.
   *                                to disable the short name, pass null
   * @param {Number} [flags]        Option type. must use one of the static types (@see CommandOption#types)
   * @param {String} [description]  Option description for the help text
   * @param {String} [valueLabel]   Label for the command value used in the help text, if available
   * @param {*}      [defaultValue] Optional default value
   */
  constructor (
    longName,
    shortName    = longName.substr( 0, 1 ),
    flags        = this.constructor.OPTIONAL,
    description  = '',
    valueLabel   = longName,
    defaultValue = null
  ) {
    this.longName    = longName;
    this.shortName   = shortName;
    this.flags       = flags;
    this.description = description;
    this.valueLabel  = valueLabel;
    this.default     = defaultValue;
  }

  /**
   * Retrieves the option syntax help string
   *
   * @return {string}
   */
  get help () {
    return ( this.shortName ? `-${this.shortName}, ` : '' ) +
           `--${this.longName}` + ( this.isFlag ? '' : ` <${this.valueLabel || this.longName}>` );
  }

  hasFlag ( flag ) {
    return ( ( this.flags & flag ) === flag );
  }

  isRequired () {
    return this.hasFlag( this.constructor.REQUIRED );
  }

  isOptional () {
    return this.hasFlag( this.constructor.OPTIONAL );
  }

  isValueRequired () {
    return this.hasFlag( this.constructor.VALUE_REQUIRED );
  }

  isValueless () {
    return this.hasFlag( this.constructor.VALUE_NONE );
  }
}

module.exports = CommandOption;
