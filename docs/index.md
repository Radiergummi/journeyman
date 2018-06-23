# Getting started
> Journeyman is an opinionated CLI tool for Vue.js projects to generate code and automate common tasks.

Similar to [Laravel's Artisan](https://laravel.com/docs/5.6/artisan), *journeyman* aims to reduce repetitive programming tasks and make working on Vue.js applications a faster and more pleasant experience, while adhering to Vue.js code style standards and best practices.

**Isn't this the same thing as `vue-cli`?**  
No, not quite. Although journeyman provdes some similar features, it doesn't primarily serve to bootstrap the development pipeline but rather to aid a developer during development work. It doesn't care at all what module bundler or linter you use.

> **Active development:** Journeyman is being developed currently. The process will be as follows:

* [ ] Outline most of the API in this README file, identify design problems beforehand  
* [x] Write tests for the base console application, build the application from there (TDD style)
* [ ] Write tests for the actual Vue code generation, implement API features from there
* [ ] Write tests for the [plugin structure](./plugins), implement it from there
* [ ] Refactoring, Optimization, real-world test cases
* [ ] ???
* [ ] PROFIT

## Installation
Journeyman should be installed as a global npm module, like so:

```sh
npm install --global @radiergummi/journeyman
```
**Please note: Journeyman isn't actually available yet, so this package isn't published right now.**

> Journeyman requires Node.js >= 8 to run.

## Usage
Journeyman can be invoked on the command line using the `journ` command. Using the `list` command, you can view a list of all available sub-commands that will be detailed in the following sections:

```sh
journ list
```

### Expected filesystem structure
Journeyman assumes your project is set up a certain way by default. This is important because any generated code must be placed in the appropriate directories. While you can configure each path (see the [configuration section](./configuration#paths)), the default structure is the best practice all `vue-cli` templates follow, for example.  
The below filesystem tree is the structure journeyman expects:

<pre>
.                    <strong><--- Working directory journ is executed in</strong>
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
Allows to bootstrap components. The component name passed as the third parameter can be either a filesystem path (`/foo/bar/MyNewComponent.vue`), a kebab-case (`my-new-component`) or a CamelCase (`MyNewComponent`) name. In each case, the name will be parsed and the file will be generated with the correct format ([Config: `preferred_spelling`](./configuration#preferred_spelling)) at the right location ([Config: `paths.components`](./configuration#paths))
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

Allows to bootstrap mixins.  
> TODO HERE

#### `journ make route`

> TODO HERE

#### `journ make module`

> TODO HERE

#### `journ make style`

> TODO HERE

### `journ extract`
The `extract` command allows extraction of code into mixins, styles into stylesheets and large templates into individual components.

> TODO HERE

### `journ inline`
The exact opposite of the `extract` command, `inline` allows to inline external code into your components.

> TODO HERE

### `journ lint`
The `lint` command performs a Vue.js coding style check on your code-base. This allows you to verify all your components adhere to the same style rules. In contrary to `eslint` for example, This will not check your JS code (there are a lot of perfectly fine tools for this job), but rather verify all your code is streamlined and follows best practices.  
There are a bunch of linting rules available in [the configuration](./configuration#linting-rules).

Additionally, if configured so, `lint` will check your JSDoc comments to make sure they a) exist, b) are complete and c) are correct. It will also look for repetitions throughout your components which are probably opportunities for mixins.

### `journ config`
The `config` command allows to read and write configuration values.

#### `journ config get`
Use the following command to read the configuration:

```sh
journ config get [<value>]
```

#### `journ config set`
Use the following command to set a configuration value:

```sh
journ config set <key> <value>
```

#### `journ config init`
Use the following command to write the default configuration values to your `package.json` or `.journeyman` file. This way, you've got all available configuration values at hand to modify them to your liking:

```sh
journ config init [--package,-p] [--dotfile,-d]
```

Using the `--package` or `--dotfile` parameter, you can optionally specify the target: `package.json` or `.journeyman`.  
The default is `--package`.


> TODO HERE
