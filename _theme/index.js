const fs                       = require( 'fs' );
const path                     = require( 'path' );
const File                     = require( 'vinyl' );
const _                        = require( 'lodash' );
const createFormatters         = require( 'documentation' ).util.createFormatters;
const LinkerStack              = require( 'documentation' ).util.LinkerStack;
const createMarkdownFormatters = require( './helpers/formatters' );

module.exports = function ( comments, config ) {
  const linkerStack = new LinkerStack( config ).namespaceResolver(
    comments,
    function ( namespace ) {
      return `/journeyman/api/${namespace}`;
    }
  );

  const formatters         = createFormatters( linkerStack.link );
  const markdownFormatters = createMarkdownFormatters( linkerStack.link );

  const sharedImports = {
    imports: {
      shortSignature:     markdownFormatters.shortSignature,
      staticSignature:    markdownFormatters.staticSignature,
      signature:          markdownFormatters.signature,
      md:                 markdownFormatters.md,
      parameter:          markdownFormatters.parameter,
      formatType:         markdownFormatters.type,
      autolink:           markdownFormatters.autolink,
      highlight:          markdownFormatters.highlight,
      protectedHighlight: markdownFormatters.protectedHighlight,
      noBreaks ( str ) {
        return str.replace( /\n/g, '' );
      }
    }
  };

  sharedImports.imports.renderSectionList = _.template(
    fs.readFileSync( path.join( __dirname, 'section_list._' ), 'utf8' ),
    sharedImports
  );

  sharedImports.imports.renderNamespaceMemberList = _.template(
    fs.readFileSync( path.join( __dirname, 'namespace_member_list._' ), 'utf8' ),
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

  const namespaceTemplate = _.template(
    fs.readFileSync( path.join( __dirname, 'namespace._' ), 'utf8' ),
    sharedImports
  );

  // push assets into the pipeline as well.
  return Promise.resolve( Array.prototype.concat( ...[
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
      ),

    comments
      .filter( comment => comment.kind === 'namespace' )
      .map( comment => new File(
        {
          path:     comment.name + '.md',
          contents: Buffer.from(
            namespaceTemplate( {
                                 section: comment,
                                 config
                               } ),
            'utf8'
          )
        } )
      )
  ] ) );
};
