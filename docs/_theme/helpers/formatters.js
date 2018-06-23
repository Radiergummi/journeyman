'use strict';

const Syntax              = require( 'doctrine-temporary-fork' ).Syntax;
const remark              = require( 'remark' );
const universalSyntaxTree = require( './universalSyntaxTree' );
const typeFormatter       = require( './formatType' );

module.exports = function ( getHref ) {
  const md   = function ( ast, inline ) {
    if (
      inline &&
      ast &&
      ast.children.length &&
      ast.children[ 0 ].type === 'paragraph'
    ) {
      ast = {
        type:     'root',
        children: ast.children[ 0 ].children.concat( ast.children.slice( 1 ) )
      };
    }

    if ( ast ) {

      // noinspection JSUnresolvedFunction
      return remark().stringify( ast );
    }
    return '';
  };

  const type = function ( type ) {
    if ( typeof type === 'undefined' ) {
      return '';
    }

    return md( universalSyntaxTree( 'root', typeFormatter( getHref, type ) ) )
      .replace( /\n/g, '' );
  };

  /**
   * Format a parameter name. This is used in formatParameters
   * and just needs to be careful about differentiating optional
   * parameters
   *
   * @param {Object} param a param as a type spec
   * @param {boolean} short whether to cut the details and make it skimmable
   * @returns {string} formatted parameter representation.
   */
  const parameter = function ( param, short ) {
    if ( short ) {
      if ( param.type && param.type.type === Syntax.OptionalType ) {
        if ( param.default ) {
          return param.name + ' = ' + param.default;
        }
        return param.name + '?';
      }
      return param.name;
    }
    return param.name + ': ' + this.type( param.type ).replace( /\n/g, '' );
  };

  /**
   * Format the parameters of a function into a quickly-readable
   * summary that resembles how you would call the function
   * initially.
   *
   * @param   {Comment} section comment node from documentation
   * @param   {Boolean} [short] whether to cut the details and make it skimmable
   * @returns {String}          formatted parameters
   */
  const parameters = function ( section, short ) {
    if ( section.params ) {
      return `(${section.params.map( param => this.parameter( param, short ) ).join( ', ' )})`;
    }
    return '()';
  };

  const highlight = function ( code ) {
    return '```' + code + '```';
  };

  const protectedHighlight = function ( code ) {
    return `<div class="codehilite"><pre>${code}</pre></div>`;
  };

  return {
    md,
    type,
    parameter,
    parameters,
    highlight,
    protectedHighlight
  };
};
