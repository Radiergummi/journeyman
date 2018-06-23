'use strict';

/*
 global describe,
 it
 */

const expect = require( 'chai' ).expect;

const Schema                            = require( '../lib/Config/Schema' );
const schemaV1                          = require( '../lib/Config/Schemas/v1' );
const ConfigValidationError             = require( '../lib/Errors/ConfigValidationError' );
const ConfigValidationMissingFieldError = require( '../lib/Errors/ConfigValidationMissingFieldError' );
const ConfigValidationInvalidFieldError = require( '../lib/Errors/ConfigValidationInvalidFieldError' );
const ConfigValidationTypeError         = require( '../lib/Errors/ConfigValidationTypeError' );
const ConfigValidationValidatorError    = require( '../lib/Errors/ConfigValidationValidatorError' );

describe( 'Schema', () => {
  it( 'should create a new schema', () => {
    const schema = new Schema( {} );

    expect( schema )
      .to.be.an.instanceOf( Schema );
  } );

  it( 'should populate the schema rules', () => {
    const schema = new Schema( {} );

    expect( schema )
      .to.have.property( 'rules' )
      .that.is.an( 'object' );
  } );

  it( 'should serialize itself for JSON', () => {
    const schema = new Schema( {} );

    expect( schema.toJSON() ).to.be.an( 'object' );
  } );

  /**
   * Later schemas with higher versions should be added below,
   * this block should be "xdescribe"-d instead.
   */
  describe( 'Schema version 1', () => {
    const schema = new Schema( schemaV1 );

    it( 'should have all required fields', () => {

      expect( schema.rules )
        .to.have.keys( [
                         'preferred_spelling',
                         'paths'
                       ] );
    } );

    describe( 'preferred_spelling', () => {
      it( 'should indicate a type of string', () => {
        expect( schema.rules.preferred_spelling )
          .to.have.property(
          'type',
          String,
          `preferred_spelling must be a string (${typeof schema.rules.preferred_spelling.type} given)`
        );
      } );

      it( 'should not be required', () => {
        expect( schema.rules.preferred_spelling )
          .to.have.property(
          'required',
          false,
          'preferred_spelling must be a optional'
        );
      } );

      it( 'should have "camel" as default', () => {
        expect( schema.rules.preferred_spelling )
          .to.have.property(
          'default',
          'camel',
          'preferred_spelling must have "camel" set as default'
        );
      } );

      it( 'should have a validator that only allows "camel" and "kebab"', () => {
        expect( schema.rules.preferred_spelling )
          .to.have.property( 'validator' )
          .that.is.a( 'function' );

        expect( schema.rules.preferred_spelling.validator( 'camel' ) )
          .to.be.true;

        expect( schema.rules.preferred_spelling.validator( 'kebab' ) )
          .to.be.true;

        expect( schema.rules.preferred_spelling.validator( 'foo' ) )
          .to.be.false;

        expect( schema.rules.preferred_spelling.validator( 42 ) )
          .to.be.false;
      } );
    } );

    describe( 'paths', () => {
      it( 'should indicate a type of object', () => {
        expect( schema.rules.paths )
          .to.have.property(
          'type',
          Object,
          `paths must be an object (${typeof schema.rules.paths.type} given)`
        );
      } );

      it( 'should not be required', () => {
        expect( schema.rules.paths )
          .to.have.property(
          'required',
          false,
          'paths must be a optional'
        );
      } );

      const defaultPaths = [
        'plugins',
        'assets',
        'components',
        'mixins',
        'modules',
        'router',
        'styles',
        'build',
        'config',
        'public',
        'static'
      ];

      it( 'should have all paths as default', () => {
        expect( schema.rules.paths )
          .to.have.property( 'default' )
          .that.is.a( 'object' )
          .which.includes.all.keys( defaultPaths );
      } );

      it( 'should have a validator that checks if all paths are present', () => {
        expect( schema.rules.paths )
          .to.have.property( 'validator' )
          .that.is.a( 'function' );

        expect( schema.rules.paths.validator(
          {
            plugins:    'a',
            assets:     'b',
            components: 'c',
            mixins:     'd',
            modules:    'e',
            router:     'f',
            styles:     'g',
            build:      'h',
            config:     'i',
            public:     'j',
            static:     'k'
          }
        ) )
          .to.be.true;

        expect( schema.rules.paths.validator(
          {
            components: 'c',
            static:     'k'
          }
        ) )
          .to.be.true;

        expect( schema.rules.paths.validator(
          {
            plugins:             'a',
            assets:              'b',
            components:          'c',
            mixins:              'd',
            modules:             'e',
            router:              'f',
            styles:              'g',
            build:               'h',
            config:              'i',
            public:              'j',
            static:              'k',
            somethingAdditional: 'l'
          }
        ) )
          .to.be.false;
      } );
    } );
  } );

  describe( 'Schema validation', () => {
    const schemaA = new Schema( {
                                  foo: {
                                    type:     String,
                                    required: false,
                                    default:  'foo'
                                  },
                                  bar: {
                                    type:     Number,
                                    required: false,
                                    default:  42
                                  },
                                  baz: {
                                    type:     Array,
                                    required: false,
                                    default:  [ 10, 20, 30 ]
                                  }
                                } );

    const schemaB = new Schema( {
                                  foo: {
                                    type:     String,
                                    required: true
                                  },
                                  bar: {
                                    type:     Number,
                                    required: true
                                  }
                                } );

    const schemaC = new Schema( {
                                  something: {
                                    type:     String,
                                    required: false,
                                    default:  'none',
                                    validator ( str ) {
                                      return [ 'none', 'some', 'all' ].includes( str );
                                    }
                                  }
                                } );

    const schemaD = new Schema( {
                                  string:   {
                                    type:     String,
                                    required: false,
                                    default:  ''
                                  },
                                  number:   {
                                    type:     Number,
                                    required: false,
                                    default:  42
                                  },
                                  boolean:  {
                                    type:     Boolean,
                                    required: false,
                                    default:  true
                                  },
                                  array:    {
                                    type:     Array,
                                    required: false,
                                    default:  [ 1 ]
                                  },
                                  symbol:   {
                                    type:     Symbol,
                                    required: false,
                                    default:  Symbol.iterator
                                  },
                                  object:   {
                                    type:     Object,
                                    required: false,
                                    default:  { a: 'b' }
                                  },
                                  instance: {
                                    type:     Schema,
                                    required: false,
                                    default:  new Schema( {} )
                                  }
                                } );

    it( 'should return the JSON serialization data for undefined object parameters', () => {
      expect( schemaA.validate() )
        .to.include.all.keys( [
                                'foo',
                                'bar'
                              ] );
    } );

    it( 'should bail on invalid configuration objects', () => {
      expect( () => schemaA.validate( null ) )
        .to.throw( ConfigValidationError );

      expect( () => schemaA.validate( 42 ) )
        .to.throw( ConfigValidationError );

      expect( () => schemaA.validate( true ) )
        .to.throw( ConfigValidationError );

      expect( () => schemaA.validate( [] ) )
        .to.throw( ConfigValidationError );
    } );

    it( 'should bail on missing required fields', () => {
      expect( () => schemaB.validate( {} ) )
        .to.throw( ConfigValidationMissingFieldError );
    } );

    it( 'should set all missing fields to their default', () => {
      expect( schemaA.validate( { bar: 1 } ) )
        .to.deep.equal( {
                          foo: 'foo',
                          bar: 1,
                          baz: [ 10, 20, 30 ]
                        } );
    } );

    it( 'should validate all given fields', () => {
      expect( () => schemaA.validate( {
                                        foo: 'arbitrary',
                                        bar: 5001,
                                        baz: [ 99, 72, 19 ]
                                      } ) )
        .to.not.throw()
        .and.to.deep.equal( {
                              foo: 'arbitrary',
                              bar: 5001,
                              baz: [ 99, 72, 19 ]
                            } );

    } );

    describe( 'Field validation', () => {
      it( 'should validate individual fields', () => {
        expect( schemaC.validateField( 'something', 'some' ) )
          .to.equal( 'some' );
      } );

      it( 'should bail on validating individual invalid fields', () => {
        expect( () => schemaC.validateField( 'i do not exist', true ) )
          .to.throw( ConfigValidationInvalidFieldError );
      } );

      it( 'should bail on failed validator callbacks', () => {
        expect( () => schemaC.validateField( 'something', 'sd289ehf3joi3f' ) )
          .to.throw( ConfigValidationValidatorError );
      } );

      it( 'should validate string fields', () => {
        expect( schemaD.validateField( 'string', 'foo' ) )
          .to.equal( 'foo' );
      } );

      it( 'should bail on invalid string fields', () => {
        expect( () => schemaD.validateField( 'string', null ) )
          .to.throw( ConfigValidationTypeError );
      } );

      it( 'should validate number fields', () => {
        expect( schemaD.validateField( 'number', 42 ) )
          .to.equal( 42 );
      } );

      it( 'should bail on invalid number fields', () => {
        expect( () => schemaD.validateField( 'number', null ) )
          .to.throw( ConfigValidationTypeError );
      } );

      it( 'should validate boolean fields', () => {
        expect( schemaD.validateField( 'boolean', true ) )
          .to.equal( true );
      } );

      it( 'should bail on invalid boolean fields', () => {
        expect( () => schemaD.validateField( 'boolean', null ) )
          .to.throw( ConfigValidationTypeError );
      } );

      it( 'should validate array fields', () => {
        expect( schemaD.validateField( 'array', [ 3, 5, 7 ] ) )
          .to.deep.equal( [ 3, 5, 7 ] );
      } );

      it( 'should bail on invalid array fields', () => {
        expect( () => schemaD.validateField( 'array', null ) )
          .to.throw( ConfigValidationTypeError );
      } );

      it( 'should bail on invalid array fields when passing objects', () => {
        expect( () => schemaD.validateField( 'array', {} ) )
          .to.throw( ConfigValidationTypeError );
      } );

      it( 'should validate symbol fields', () => {
        expect( schemaD.validateField( 'symbol', Symbol.iterator ) )
          .to.equal( Symbol.iterator );
      } );

      it( 'should bail on invalid symbol fields', () => {
        expect( () => schemaD.validateField( 'symbol', 'symbol' ) )
          .to.throw( ConfigValidationTypeError );
      } );

      it( 'should validate object fields', () => {
        expect( schemaD.validateField( 'object', { a: 10, b: 20 } ) )
          .to.deep.equal( { a: 10, b: 20 } );
      } );

      it( 'should bail on invalid object fields', () => {
        expect( () => schemaD.validateField( 'object', 'foo' ) )
          .to.throw( ConfigValidationTypeError );
      } );

      it( 'should bail on invalid object fields when passing null', () => {
        expect( () => schemaD.validateField( 'object', null ) )
          .to.throw( ConfigValidationTypeError );
      } );

      it( 'should bail on invalid object fields when passing arrays', () => {
        expect( () => schemaD.validateField( 'object', [] ) )
          .to.throw( ConfigValidationTypeError );
      } );

      it( 'should validate arbitrary prototype fields', () => {
        expect( schemaD.validateField( 'instance', new Schema( { test: { type: String, required: true } } ) ) )
          .to.be.an.instanceOf( Schema );
      } );

      it( 'should bail on invalid arbitrary prototype fields', () => {
        class X {
        }

        expect( () => schemaD.validateField( 'instance', new X() ) )
          .to.throw( ConfigValidationTypeError );
      } );
    } );
  } );
} );
