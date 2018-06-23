'use strict';

module.exports = function universalSyntaxTree ( type, props, value ) {
  if ( value == null && ( typeof props !== 'object' || Array.isArray( props ) ) ) {
    value = props;
    props = {};
  }

  return Object.assign( {}, props, { type: String( type ) },
    value != null && ( Array.isArray( value )
                       ? { children: value }
                       : { value: String( value ) } )
  );
};
