'use strict';

class CommandArgument {

  /**
   * Holds the available argument types
   *
   * @return {{value_required: string, value_optional: string, value_array: string}}
   */
  static get types () {
    return {
      value_required: 'required',
      value_optional: 'optional',
      value_array:    'array'
    };
  }

  static get OPTIONAL () {
    return 1;
  }

  static get REQUIRED () {
    return 2;
  }

  static get ARRAY () {
    return 4;
  }

  /**
   * Creates a new argument. All arguments but the name are optional.
   *
   * @param {String} name          argument name
   * @param {Number} [flags]       argument type. must use one of the static types (@see CommandArgument#types)
   * @param {String} [description] argument description for the help text
   * @param {*}      [fallback]    fallback value if missing. Can only be used for optional arguments
   */
  constructor (
    name,
    flags       = this.constructor.OPTIONAL,
    description = '',
    fallback    = null
  ) {
    this.name        = name;
    this.flags       = flags;
    this.description = description;
    this.fallback    = fallback;
  }

  /**
   * Retrieves the argument syntax help string
   *
   * @return {string}
   */
  get help () {
    return this.name.toUpperCase();
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

  isArray () {
    return this.hasFlag( this.constructor.ARRAY );
  }
}

module.exports = CommandArgument;
