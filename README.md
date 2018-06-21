# journeyman
Journeyman is an opinionated CLI tool for Vue.js projects to generate code and automate common tasks.

Similar to [Laravel's Artisan](https://laravel.com/docs/5.6/artisan), *journeyman* aims to reduce repetitive programming tasks and make working on Vue.js applications a faster and more pleasant expierence, while adhering to Vue.js code style standards and best practices.

**Isn't this the same thing as `vue-cli`?**  
No, not quite. Although journeyman provdes some similar features, it doesn't primarily serve to bootstrap the development pipeline but rather to aid a developer during development work. It doesn't care at all what module bundler or linter you use.

> **Active development:** Journeyman is being developed currently. The process will be as follows:
> - [ ] Outline most of the API in this README file, identify design problems beforehand  
> - [ ] Write tests for the base console application, build the application from there (TDD style)
> - [ ] Write tests for the actual Vue code generation, implement API features from there
> - [ ] Write tests for the [plugin structure](#plugins), implement it from there
> - [ ] Refactoring, Optimization, real-world test cases
> - [ ] ???
> - [ ] PROFIT

## Installation
Journeyman should be installed as a global npm module, like so:

```sh
npm install --global @radiergummi/journeyman
```
**Please note: Journeyman isn't actually available yet, so this package isn't published right now.**

## Usage
Journeyman can be invoked on the command line using the `journ` command. Using the `list` command, you can view a list of all available subcommands that will be detailed in the following sections:

```sh
journ list
```

### Expected filesystem structure
Journeyman assumes your project is set up a certain way by default. This is important because any generated code must be placed in the appropriate directories. While you can configure each path (see the [configuration section](#configuration)), the default structure is the best practice all `vue-cli` templates follow, for example.  
The below filesysytem tree is the structure journeyman expects:

<pre>
.                      <strong><--- Working directory journ is executed in</strong>
├── build/
├── config/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── mixins/
│   ├── modules/
│   ├── router/
│   └── styles/
├── static/
├── test/
└── package.json
</pre>

### `journ make`
The `make` command creates new files on the file system. It allows to bootstrap components, mixins and modules, for example. Use `journ list make` to view a list of available boots to strap (heh).

#### `journ make component`
Allows to bootstrap components. The component name passed as the third parameter can be either a filesystem path (`/foo/bar/MyNewComponent.vue`), a kebab-case (`my-new-component`) or a CamelCase (`MyNewComponent`) name. In each case, the name will be parsed and the file will be generated with the correct format ([Config: `preferred_spelling`](#preferred-spelling)) at the right location ([Config: `paths.components`](#paths))
Generated components are described in detail later on.  

```sh
# Bootstrap a new, empty component
journ make component MyNewComponent

# You can use shorthands, too
journ m c MyNewComponent
```

Journeyman also supports extends and mixins as well as cloning:

```sh
# New component extending another
journ make component MyOtherComponent --extends MyNewComponent

# New component using one or more mixins
journ make component MyOtherComponent --with oneMixin --with anotherMixin

# New component based on another
journ make component MyOtherComponent --from MyNewComponent
```

Cloned components will have all properties from the source component but with a new name.

#### `journ make mixin`

TODO HERE

### `journ config`
Use the following command to read the configuration:

```sh
journ config get [<value>]
```

Use the following command to set a configuration variable:

```sh
journ config set <key> <value>
```

TODO HERE

## Configuration
Journeyman allows to set some configuration variables to control its behaviour. This configuration can be stored either in a `.journeyman` file or directly in the `package.json` below the key `journeyman` which is the preferred way (avoids yet *another* dot file in your project).  
In general, it comes with a set of sensible defaults:

### `paths`
To set the output paths generated code should be written to, you can set one or more of the following path settings. Each of them will overwrite the default.

| Key          |           Default |                                            Description |
|:-------------|------------------:|:-------------------------------------------------------|
| `assets`     |     `./src/assets`| Path where all assets live                             |
| `components` | `./src/components`| Path where all components (`.vue` files) live          |
| `mixins`     |    `./src/mixins` | Path where all mixins (`.js` files) live               |
| `modules`    |   `./src/modules` | Path where all modules (`.js` files, helpers) live     |
| `router`     |    `./src/router` | Path to the main router file                           |
| `styles`     |    `./src/styles` | Path where all stylesheets (`.css`/`.scss` files) live |
| `build`      |         `./build` | Path where the build modules live                      |
| `config`     |        `./config` | Path where the build configuration lives               |
| `public`     |        `./public` | Path where the build is written to                     |
| `static`     |        `./static` | Path where static assets live                          |

### `preferred_spelling`
This setting controls how journeyman generates component names and inserts them, for example. This also applies to file names on the file system. There are two options available:
 - `camel`: Names are generated in **CamelCase**.
 - `kebab`: Names are generated in **kebab-case**.

## Plugins
Journeyman provides a few ways to add new functionality, that is: To add new, first-class citizen, commands to `journ`. In fact, *all* integrated commands are actually plugins.  
Plugins are special npm packages that must fulfill a few requirements:

 - **Their package name starts with `journeyman-plugin-`:**  
   This serves to keep the npm namespace clean and make plugins more obvious. I can't stand packages like `body-parser` that are secretly `express.js` plugins.
 - **Their `package.json` file includes a `journeyman-plugin` key:**  
   This key provides plugin metadata. The available fields are outlined in [Plugin metadata fields](#plugin-metadata-fields)
 - **They export a class (*not an instance!*) from their main module that extends the base plugin:**  
   Journeyman provides a base class at [`src/plugins/Plugin`](./src/plugins/Plugin.js) that all plugins need to inherit from. It provides several methods Journeyman uses to initialize the plugin and work with it's input and output. This frees implementations from caring about API compatibility and implementation details.

Basically, a plugin provides a new subcommand to journeyman that all its methods are grouped below. A simple plugin might look like this:

```js
const Plugin = require('journeyman/plugins/Plugin');

// or:
// const { Plugin } = require('journeyman');

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

### One-Shot plugins
If your plugin only serves a single purpose -- eg. it doesn't need multiple sub-commands -- you can use one-shot plugins. The only difference to ordinary plugins is that they include the special `__invoke` method: If a plugin provides it, journeyman assumes the plugin doesn't need a namespace and only has a single, public command, callable as `journ <plugin name> --params`. If journeyman finds the \_\_invoke method  inside your plugin, it will disregard any other public methods. As ordinary command methods, `__invoke` receives the application instance as its only parameter.

```js
const Plugin = require('journeyman/plugins/Plugin');

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

### The `app` parameter to your command methods
`app` is an object with several well-defined properties revolving around the command execution lifecycle. It contains everything the command will need to carry out its purpose:

| Name                             | Type                                | Description                             |
|:---------------------------------|-------------------------------------|:----------------------------------------|
| `journeyman`                     | [`JourneyMan`](./src/JourneyMan.js) | The current `JourneyMan` instance.      |
| `env`                            | `Map<k: String, v: String>`         | Holds all system environment variables. |
| `input`                          | [`Input`](./src/cli/Input.js)       | Holds the command line input object.    |
| `output`                         | [`Output`](./src/cli/Output.js)     | Holds the command line output object.   |
| `plugins`                        | `Array<Plugin>`                     | Holds the list of available plugins. Alias to [`journeyman.plugins`](./src/JourneyMan.js). |
| `call(command: String): Promise` | `function`                          | Allows to call other commands by their full command input string. |

> More properties and methods will be added as the development continues.

### Advanced plugins
Single-class and one-shot plugins will be fine for most purposes. But what if you've got actual *work* to do? Fear not, for there's a third structural option: Instead of providing the individual commands as methods on your plugin, you can also provide a list of [`Command`](./src/plugins/Command) instances.  
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
```

That's a whole slew of new stuff, so be sure to check out the [Command documentation](#commands).

## Providing new commands for journeymans existing subcommands
That's all fine and dandy, but what if you'd like to provide a new `make <something>`? For these cases, you can extend the special `MakePlugin` class instead of `Plugin`. All commands provided in these will be appended to the `make` subcommand. Beneath `MakePlugin`, there's also `LinkPlugin`, `ServePlugin` and `BuildPlugin` to extend the respective verbs.

> More extend-plugins will be added as the development continues.

### Plugin metadata fields
The following `package.json` properties of the `journeyman-plugin` key are recognized:

| Name       | Type     | Description | Required |
|:-----------|----------|:------------|---------:|
| `name`     | `String` | The plugins human-readable name. This will be used in the plugin list, for example. Defaults to the package name. | No |
| `defaults` | `Object` | Any default configuration you might need for your plugin. Defaults to an empty hash. | No |

> More properties will be added as the development continues.
