# journeyman
Journeyman is a CLI tool for Vue.js projects to generate code and automate common tasks.

Similar to [Laravel's Artisan](https://laravel.com/docs/5.6/artisan), *journeyman* aims to reduce repetitive programming tasks and make working on Vue.js applications a faster and more pleasant expierence, while adhering to Vue.js code style standards and best practices.

**Isn't this the same thing as `vue-cli`?**  
No, not quite. Although journeyman provdes some similar features, it doesn't primarily serve to bootstrap the development pipeline but rather to aid a developer during development work. It doesn't care at all what module bundler or linter you use.

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

### `journ make`
The `make` command creates new files on the file system. It allows to bootstrap components, mixins and modules, for example. Use `journ list make` to view a list of available boots to strap (heh).  

```sh
# Bootstrap a new, empty component
journ make component MyNewComponent

# 
```
