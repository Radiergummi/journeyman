'use strict';

const Command = require( '../../../Plugins/Command' );

class ComponentCommand extends Command {
  static get name () {
    return 'component';
  }

  __configure ( config ) {
    this.setDescription( 'Creates a new component' );
    this.addOption( 'component_name', 'Name of the new component', Command.OPTION_REQUIRED );
    this.addParam(
      'extends',
      'e',
      'Name of the component to extend',
      Command.PARAM_OPTIONAL | Command.PARAM_VALUE_REQUIRED
    );
    this.addParam(
      'from',
      'f',
      'Name of the component to inherit from',
      Command.PARAM_OPTIONAL | Command.PARAM_VALUE_REQUIRED
    );
    this.addParam(
      'with',
      'w',
      'Name of the component to extend',
      Command.PARAM_OPTIONAL | Command.PARAM_VALUE_REQUIRED | Command.PARAM_MULTIPLE_ALLOWED
    );
  }

  __invoke ( app ) {
    // TODO: Create component
    if ( app.input.options.from ) {
      // Create cloned component
    }

    if ( app.input.options.extends ) {
      // Create extended component
    }

    if ( app.input.options.with.length > 0 ) {
      // Create component with mixins
    }

    app.output.writeLn( 'Successfully created component ' + app.input.options.component_name );
  }
}

module.exports = ComponentCommand;
