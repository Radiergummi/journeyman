'use strict';

const CorePlugin = require( '../CorePlugin' );

const ComponentCommand = require( './MakeCommands/ComponentCommand' );
const MixinCommand     = require( './MakeCommands/MixinCommand' );
const RouteCommand     = require( './MakeCommands/RouteCommand' );
const ModuleCommand    = require( './MakeCommands/ModuleCommand' );
const StyleCommand     = require( './MakeCommands/StyleCommand' );

class MakePlugin extends CorePlugin {
  static get name () {
    return 'make';
  }

  static get commands () {
    return [
      ComponentCommand,
      MixinCommand,
      RouteCommand,
      ModuleCommand,
      StyleCommand
    ];
  }
}

module.exports = MakePlugin;
