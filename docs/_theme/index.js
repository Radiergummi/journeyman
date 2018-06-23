const fs                       = require( 'fs' );
const path                     = require( 'path' );
const File                     = require( 'vinyl' );
const _                        = require( 'lodash' );
const GithubSlugger            = require( 'github-slugger' );
const createFormatters         = require( 'documentation' ).util.createFormatters;
const LinkerStack              = require( 'documentation' ).util.LinkerStack;
const createMarkdownFormatters = require( './helpers/formatters' );

function isFunction ( section ) {
  return (
    section.kind === 'function' ||
    ( section.kind === 'typedef' &&
      section.type.type === 'NameExpression' &&
      section.type.name === 'Function' )
  );
}

module.exports = function ( comments, config ) {
  const linkerStack = new LinkerStack( config ).namespaceResolver(
    comments,
    function ( namespace ) {
      console.log( 'building link for', namespace );
      return `/${namespace}`;
    }
  );

  const formatters         = createFormatters( linkerStack.link );
  const markdownFormatters = createMarkdownFormatters( linkerStack.link );

  const sharedImports = {
    imports: {
      slug ( str ) {
        const slugger = new GithubSlugger();

        return slugger.slug( str );
      },

      shortSignature ( section ) {
        let prefix = '';

        if ( section.kind === 'class' ) {
          prefix = 'new ';
        } else if ( !isFunction( section ) ) {
          return section.name;
        }

        return prefix + section.name + formatters.parameters( section, true );
      },

      signature ( section ) {
        let returns = '';
        let prefix  = '';

        if ( section.kind === 'class' ) {
          prefix = '\nnew ';
        } else if ( !isFunction( section ) ) {
          return section.name;
        }

        if ( section.returns.length ) {
          returns = ': ' + formatters.type( section.returns[ 0 ].type );
        }

        return markdownFormatters.protectedHighlight(
          prefix + section.name + formatters.parameters( section ) + returns
        );
      },

      md: markdownFormatters.md,

      formatType: markdownFormatters.type,

      autolink: formatters.autolink,

      highlight:          markdownFormatters.highlight,
      protectedHighlight: markdownFormatters.protectedHighlight
    }
  };

  sharedImports.imports.renderSectionList = _.template(
    fs.readFileSync( path.join( __dirname, 'section_list._' ), 'utf8' ),
    sharedImports
  );

  sharedImports.imports.renderSection = _.template(
    fs.readFileSync( path.join( __dirname, 'section._' ), 'utf8' ),
    sharedImports
  );

  sharedImports.imports.renderNote = _.template(
    fs.readFileSync( path.join( __dirname, 'note._' ), 'utf8' ),
    sharedImports
  );

  sharedImports.imports.renderParamProperty = _.template(
    fs.readFileSync( path.join( __dirname, 'paramProperty._' ), 'utf8' ),
    sharedImports
  );

  const sectionTemplate = _.template(
    fs.readFileSync( path.join( __dirname, 'section._' ), 'utf8' ),
    sharedImports
  );

  // push assets into the pipeline as well.
  return Promise.resolve(
    comments
      .filter( comment => comment.kind === 'class' )
      .map( comment => new File(
        {
          path:     comment.name + '.md',
          contents: Buffer.from(
            sectionTemplate( {
                               section: comment,
                               config
                             } ),
            'utf8'
          )
        } )
      )
  );
};
