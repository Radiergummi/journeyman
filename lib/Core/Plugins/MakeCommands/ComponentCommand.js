'use strict';

const Command         = require( '../../../Console/Command' );
const CommandOption   = require( '../../../Console/Commands/CommandOption' );
const CommandArgument = require( '../../../Console/Commands/CommandArgument' );

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
   * @param {{ input: Input }} context
   * @private
   */
  __invoke ( context ) {
    // TODO: Create component
    console.log( `Intending to make component "${context.input.getArgument( 'component_name' )}", with additional option baz: ${context.input.getOption(
      'baz' )}` );
    if ( context.input.options.from ) {
      // Create cloned component
    }

    if ( context.input.options.extends ) {
      // Create extended component
    }

    if ( context.input.hasOption( 'with' ) && context.input.options.with.length > 0 ) {
      // Create component with mixins
    }

//    context.output.writeLn( 'Successfully created component ' + context.input.options.component_name );
  }
}

module.exports = ComponentCommand;
