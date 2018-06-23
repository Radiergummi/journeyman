'use strict';

const expect = require( 'chai' ).expect;

const crypto                    = require( 'crypto' );
const fs                        = require( 'fs' );
const { promisify }             = require( 'util' );
const writeFile                 = promisify( fs.writeFile );
const readFile                  = promisify( fs.readFile );
const unlink                    = promisify( fs.unlink );
const path                      = require( 'path' );
const Config                    = require( '../lib/Config/Config' );
const InvalidConfigFileError    = require( '../lib/Errors/InvalidConfigFileError' );
const ConfigValidationTypeError = require( '../lib/Errors/ConfigValidationTypeError' );
const ConfigValidationValidatorError    = require( '../lib/Errors/ConfigValidationValidatorError' );

describe( 'Config', () => {
  it( 'should create a new config', () => {
    const config = new Config( path.join( __dirname, 'fixtures', 'config.json' ) );

    expect( config )
      .to.be.an.instanceOf( Config );
  } );

  it( 'should bail on invalid config file paths', () => {
    expect( () => new Config( 'nope' ) )
      .to.throw( InvalidConfigFileError );
  } );

  it( 'should read config files', async () => {
    const filename = path.join(
      __dirname,
      'fixtures',
      crypto.randomBytes( 5 ).toString( 'hex' ) + '.json'
    );

    await writeFile( filename, JSON.stringify(
      {
        foo: 'test',
        bar: 42
      }
    ) );

    const config = new Config(
      filename,
      null,
      {
        foo: {
          type:     String,
          required: true
        },
        bar: {
          type:     Number,
          required: true
        }
      }
    );

    expect( config )
      .to.have.property( 'foo', 'test' );

    expect( config )
      .to.have.property( 'bar', 42 );

    await unlink( filename );
  } );

  it( 'should create enumerable property accessors for all config properties', () => {
    const config = new Config(
      path.join( __dirname, 'fixtures', 'config.json' ),
      null,
      {
        foo: {
          type:     String,
          required: true
        },
        bar: {
          type:     Number,
          required: true
        }
      }
    );

    expect( Object.keys( config ) )
      .to.include.members( [ 'foo', 'bar' ] );
  } );

  it( 'should write changes to config files', async () => {
    const filename = path.join(
      __dirname,
      'fixtures',
      crypto.randomBytes( 5 ).toString( 'hex' ) + '.json'
    );

    await writeFile( filename, JSON.stringify(
      {
        foo: 'test',
        bar: 42
      }
    ) );

    const config = new Config(
      filename,
      null,
      {
        foo: {
          type:     String,
          required: true
        },
        bar: {
          type:     Number,
          required: true
        }
      }
    );

    config.foo = 'something else';
    config.bar = 5001;

    // The timeout accounts for the async setters writing to file
    return new Promise( resolve => setTimeout( async () => {
      const configFileContent = await readFile( filename );

      expect( JSON.parse( configFileContent ) )
        .to.deep.equal(
        {
          foo: 'something else',
          bar: 5001
        }
      );

      await unlink( filename );

      resolve();
    }, 5 ) );
  } );

  it( 'should bail on setting invalid options', () => {
    const config = new Config(
      path.join( __dirname, 'fixtures', 'config.json' ),
      null,
      {
        foo: {
          type:     String,
          required: true
        },
        bar: {
          type:     Number,
          required: true,
          validator ( val ) {
            return val < 50;
          }
        }
      }
    );

    expect( () => config.foo = 42 )
      .to.throw( ConfigValidationTypeError );

    expect( () => config.bar = 'test' )
      .to.throw( ConfigValidationTypeError );

    expect( () => config.bar = 60 )
      .to.throw( ConfigValidationValidatorError );
  } );
} );
