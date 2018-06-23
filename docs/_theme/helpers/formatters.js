'use strict';

const Syntax              = require( 'doctrine-temporary-fork' ).Syntax;
const remark              = require( 'remark' );
const remarkHtml          = require( 'remark-html' );
const universalSyntaxTree = require( './universalSyntaxTree' );
const formatType          = require( './formatType' );
const _rerouteLinks       = require( './rerouteLinks' );

function isFunction ( section ) {
  return (
    section.kind === 'function' ||
    ( section.kind === 'typedef' &&
      section.type.type === 'NameExpression' &&
      section.type.name === 'Function' )
  );
}

module.exports = function ( getHref ) {
  const rerouteLinks = _rerouteLinks.bind( undefined, getHref );

  const shortSignature = function ( section ) {
    let prefix = '';

    if ( section.kind === 'class' ) {
      prefix = 'new ';
    } else if ( !isFunction( section ) ) {
      return section.name;
    }

    return prefix + section.name + parameters( section, true );
  };

  const shortNamespaceMemberSignature = function ( section ) {
    let prefix = '';

    if ( section.kind !== 'class' && !isFunction( section ) ) {
      return section.name;
    }

    return prefix + section.name + parameters( section, true );
  };

  const signature = function ( section ) {
    let returns = '';
    let prefix  = '';

    if ( section.kind === 'class' ) {
      prefix = '\nnew ';
    } else if ( !isFunction( section ) ) {
      return section.name;
    }

    if ( section.returns.length ) {
      returns = ': ' + type( section.returns[ 0 ].type );
    }

    return protectedHighlight( prefix + section.name + parameters( section ) + returns );
  };

  const md = function ( ast, inline ) {
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
      return remark()
        .stringify( rerouteLinks( ast ) );
    }
    return '';
  };

  /**
   * Convert a remark AST to a string of HTML, rerouting links as necessary
   *
   * @param   {Object}  ast      remark-compatible AST
   * @param   {Boolean} [inline]
   * @returns {String}           HTML
   */
  const html = function ( ast, inline ) {
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
      return remark()
        .use( remarkHtml )
        .stringify( rerouteLinks( ast ) );
    }

    return '';
  };

  const type = function ( type ) {
    if ( typeof type === 'undefined' ) {
      return '';
    }

    return html( universalSyntaxTree( 'root', formatType( getHref, type ) ) )
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

    return param.name + (
      param.type
      ? ': ' + html( universalSyntaxTree( 'root', formatType( getHref, param.type ) ) )
             .replace( /\n/g, '' )
      : ''
    );
  };

  /**
   * Format the parameters of a function into a quickly-readable
   * summary that resembles how you would call the function
   * initially.
   *
   * @param   {Comment} section        comment node from documentation
   * @param   {Array}   section.params comment node from documentation
   * @param   {Boolean} [short]        whether to cut the details and make it skimmable
   * @returns {String}                 formatted parameters
   */
  const parameters = function ( section, short ) {
    if ( section.params ) {
      return `(${section.params.map( param => parameter( param, short ) ).join( ', ' )})`;
    }

    return '()';
  };

  const highlight = function ( code ) {
    return '```' + code + '```';
  };

  const protectedHighlight = function ( code ) {
    return `<div class="codehilite"><pre>${code}</pre></div>`;
  };

  /**
   * Link text to this page or to a central resource.
   * @param   {string} text inner text of the link
   * @returns {string}      potentially linked HTML
   */
  const autolink = function ( text ) {
    const href = getHref( text );
    if ( href ) {

      // TODO: this is a temporary fix until we drop remark 3.x support,
      // and then we should remove the 'href' property and only
      // have the url property of links
      return md( universalSyntaxTree(
        'link',
        {
          href,
          url: href
        },
        [ universalSyntaxTree( 'text', text ) ]
      ) ).replace( /\n/g, '' );
    }
    return md( universalSyntaxTree( 'text', text ) ).replace( /\n/g, '' );
  };

  return {
    shortSignature,
    shortNamespaceMemberSignature,
    signature,
    md,
    html,
    type,
    parameter,
    parameters,
    highlight,
    protectedHighlight,
    autolink
  };
};
