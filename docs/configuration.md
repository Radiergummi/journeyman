# Configuration
Journeyman allows to set some configuration variables to control its behaviour. This configuration can be stored either in a `.journeyman` file or directly in the `package.json` below the key `journeyman` which is the preferred way (avoids yet *another* dot file in your project).  
In general, it comes with a set of sensible defaults:

## `paths`
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

## `preferred_spelling`
This setting controls how journeyman generates component names and inserts them, for example. This also applies to file names on the file system. There are two options available:
 - `camel`: Names are generated in **CamelCase**.
 - `kebab`: Names are generated in **kebab-case**.

