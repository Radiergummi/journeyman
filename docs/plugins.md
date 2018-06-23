# Plugins
Journeyman provides a few ways to add new functionality, that is: To add new, first-class citizen, commands to `journ`. In fact, *all* integrated commands are actually plugins.  
Plugins are special npm packages that must fulfill a few requirements:

 - **Their package name starts with `journeyman-plugin-`:**  
   This serves to keep the npm namespace clean and make plugins more obvious. I can't stand packages like `body-parser` that are secretly `express.js` plugins.
 - **Their `package.json` file includes a `journeyman-plugin` key:**  
   This key provides plugin metadata. The available fields are outlined in [Plugin metadata fields](#plugin-metadata-fields)
 - **They export a class (*not an instance!*) from their main module that extends the base plugin:**  
   Journeyman provides a base class at [`lib/plugins/Plugin`](./lib/Plugins/Plugin.js) that all plugins need to inherit from. It provides several methods Journeyman uses to initialize the plugin and work with it's input and output. This frees implementations from caring about API compatibility and implementation details.

Basically, a plugin provides a new subcommand to journeyman that all its methods are grouped below. A simple plugin might look like this:

```js
const { Plugin } = require('journeyman');

class EchoPlugin extends Plugin {

  /**
   * The static property "name" is used as the subcommand namespace for your plugin
   */
  static get name() {
    return 'echo';
  }

  /**
   * This is a private method (as far as JS supports it, at least...). It will *not* be visible 
   * nor accessible from the command line due to the single underscore prefix.
   */
  _prepareOutput(str) {
    return 'echo ' + str;
  }

  /**
   * This is a public method (no leading underscore). It will be used as a publicly visible command below your
   * plugin namespace:
   * journ echo foo
   */
  foo(app) {
    const output = this._prepareOutput(app.input.args);

    return Promise.resolve(output);
  }
}
```

## One-Shot plugins
If your plugin only serves a single purpose -- eg. it doesn't need multiple sub-commands -- you can use one-shot plugins. The only difference to ordinary plugins is that they include the special `__invoke` method: If a plugin provides it, journeyman assumes the plugin doesn't need a namespace and only has a single, public command, callable as `journ <plugin name> --params`. If journeyman finds the \_\_invoke method  inside your plugin, it will disregard any other public methods. As ordinary command methods, `__invoke` receives the application instance as its only parameter.

```js
const { Plugin } = require('journeyman');

class FooPlugin extends Plugin {
  static get name() {
    return 'foo';
  }

  /**
   * This is a special one: For single-shot plugins, you can use the __invoke method. 
   */
  __invoke(app) {
    const output = this._prepareOutput(app.input.args);

    return Promise.resolve(output);
  }
}
```

## The `app` parameter to your command methods
`app` is an object with several well-defined properties revolving around the command execution lifecycle. It contains everything the command will need to carry out its purpose:

| Name                             | Type                                | Description                             |
|:---------------------------------|-------------------------------------|:----------------------------------------|
| `journeyman`                     | [`JourneyMan`](./lib/JourneyMan.js) | The current `JourneyMan` instance.      |
| `env`                            | `Map<k: String, v: String>`         | Holds all system environment variables. |
| `input`                          | [`Input`](./lib/Console/Input.js)       | Holds the command line input object.    |
| `output`                         | [`Output`](./lib/Console/Output.js)     | Holds the command line output object.   |
| `plugins`                        | `Array<Plugin>`                     | Holds the list of available plugins. Alias to [`journeyman.plugins`](./lib/JourneyMan.js). |
| `call(command: String): Promise` | `function`                          | Allows to call other commands by their full command input string. |

> More properties and methods will be added as the development continues.

## Advanced plugins
Single-class and one-shot plugins will be fine for most purposes. But what if you've got actual *work* to do? Fear not, for there's a third structural option: Instead of providing the individual commands as methods on your plugin, you can also provide a list of [`Command`](./lib/Console/Command.js) instances.  
This provides you with a belly of additional goodies, like automatic help generation, fine-grained parameter and option handling as well as neatly organized code.

A plugin using Command instances might look like this:

```js
const { Plugin } = require('journeyman');
const FooCommand = require('./commands/FooCommand');
const BarCommand = require('./commands/BarCommand');

class MyAdvancedPlugin extends Plugin {
  static get name() {
    return 'advanced';
  }
  
  /**
   * This overrides the default of an empty array
   */
  static get commands() {
    return [
      FooCommand,
      BarCommand
    ];
  }

  /**
   * Of course, you're still free to define additional commands using methods
   */
  baz(app) {
    // ...
  }
} 
```

A command class for our plugin, say `FooCommand`, should be constructed like this:

```js
const { Command } = require('journeyman');

class FooCommand extends Command {

  /**
   * Since we don't have a method name at our disposal, we can set it here. If omitted, 
   * the name will be inferred from the class name ( Class.name.replace('Command', '').toLowerCase() )
   */
  static get name() {
    return 'foo';
  }
  
  /**
   * The __configure() method is called on initialization and allows to configure the command (duh)
   */
  __configure() {
  
    // a little Symfony-y
    this.setDescription('Creates a new foo');
    this.addParameter('name', 'n', 'How to name your foo', Command.PARAM_TYPE_STRING);
  }

  /**
   * The behaviour is the same as with plugin method commands here
   */
  __invoke(app) {
    return Promise.resolve();
  }
}
```

That's a whole slew of new stuff, so be sure to check out the [Command documentation](#commands).

## Providing new commands for journeyman's existing sub-commands
That's all fine and dandy, but what if you'd like to provide a new `make <something>`? For these cases, you can extend the special `MakePlugin` class instead of `Plugin`. All commands provided in these will be appended to the `make` subcommand. Beneath `MakePlugin`, there's also `LinkPlugin`, `ServePlugin` and `BuildPlugin` to extend the respective verbs.

> More extend-plugins will be added as the development continues.

## Plugin metadata fields
The following `package.json` properties of the `journeyman-plugin` key are recognized:

| Name       | Type     | Description | Required |
|:-----------|----------|:------------|---------:|
| `name`     | `String` | The plugins human-readable name. This will be used in the plugin list, for example. Defaults to the package name. | No |
| `defaults` | `Object` | Any default configuration you might need for your plugin. Defaults to an empty hash. | No |

> More properties will be added as the development continues.
