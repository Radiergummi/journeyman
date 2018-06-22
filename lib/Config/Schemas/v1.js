'use strict';

module.exports = {
  preferred_spelling: {
    type:     String,
    required: false,
    default:  'camel',
    validator ( spelling ) {
      return [ 'camel', 'kebab' ].includes( spelling );
    }
  },

  paths: {
    type:     Object,
    required: false,
    default:  {
      plugins:    './.journeyman',
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

      for ( let key of keys ) {
        if ( !requiredKeys.includes( key ) ) {
          return false;
        }
      }

      return true;
    }
  }
};
