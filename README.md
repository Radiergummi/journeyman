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

```
.                      <--- Working directory journ is executed in
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
```

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

| key          |           default |                                            description |
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
