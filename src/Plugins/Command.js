'use strict';

/*
 * global module,
 * require
 */

const Plugin = require('./Plugin');
const InvalidInstantiationError = require('../Errors/InvalidInstantiationError');

class Command {

  /**
   * Holds the name of the command.
   */
  static get name() {
    return '';
  }

  /**
   * Creates a new command instance.
   *
   * @param {Plugin} plugin
   */
  constructor(plugin) {
    if (!(plugin instanceof Plugin)) {
      throw new InvalidInstantiationError(this, plugin);
    }
    
    this.$plugin = plugin;
  }
  
  /**
   * Configures the command.
   *
   * @returns {void}
   */
  __configure() {
    this.name = this.constructor.name;
  }
  
  /**
   * Executes the command. All commands should return a Promise, even though it isn't strictly
   * necessary since you can `await` non-Promise returning functions too. 
   *
   * @returns {Promise<String|Number>|*}
   */
  __invoke(context) {
    return Promise.resolve(null);
  }
}

module.exports = Command;