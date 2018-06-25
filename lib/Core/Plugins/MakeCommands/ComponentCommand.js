'use strict';

const Command         = require( '../../../Console/Command' );
const CommandOption   = require( '../../../Console/Commands/CommandOption' );
const CommandArgument = require( '../../../Console/Commands/CommandArgument' );
const {
        VERBOSITY_QUIET,
        VERBOSITY_DEBUG,
        VERBOSITY_VERBOSE,
        VERBOSITY_NORMAL,
        VERBOSITY_DEFAULT
      }               = require( '../../../Console/Output' );

class ComponentCommand extends Command {
  static get name () {
    return 'component';
  }

  __configure () {
    this.setDescription( 'Creates a new component' );

    this.addArgument(
      'component_name',
      CommandArgument.REQUIRED,
      'Name of the new component'
    );

    this.addOption(
      'extends',
      'e',
      CommandOption.OPTIONAL | CommandOption.VALUE_REQUIRED,
      'Name of the component to extend'
    );

    this.addOption(
      'from',
      'f',
      CommandOption.OPTIONAL,
      'Name of the component to inherit from'
    );

    this.addOption(
      'with',
      'w',
      CommandOption.OPTIONAL | CommandOption.VALUE_REQUIRED,
      'Name of the component to extend'
    );
  }

  /**
   *
   * @param {{ input: Input, output: Output }} context
   * @private
   */
  __invoke ( context ) {
    // TODO: Create component
    context.output.writeLn(
      `Intending to make component "{name}", with additional option baz: {baz}`,
      VERBOSITY_QUIET,
      {
        name: context.input.getArgument( 'component_name' ),
        baz:  context.input.getOption( 'baz' )
      }
    );

    if ( context.input.hasOption( 'from' ) ) {
      // Create cloned component
    }

    if ( context.input.hasOption( 'extends' ) ) {
      // Create extended component
    }

    if ( context.input.hasOption( 'with' ) && context.input.getOption( 'with', [] ).length > 0 ) {
      // Create component with mixins
    }

    context.output.writeLn( 'Successfully created component ' + context.input.getArgument( 'component_name' ) );

    context.output.getStdErr().writeLn( 'this is an error' );
  }
}

module.exports = ComponentCommand;
