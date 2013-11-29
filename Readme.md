# Flatten

Flatten packages in node_modules

Nested node_modules are subjectively messy and sometimes we want it to be flat. Note that your node_modules might be exploded. Use it wisely.

## Installation

```
$ npm install -g flatten
```

## How to use

Run executable `flatten` to aggressively rearrange all packages in node_modules folder in the project directory. By aggressive, it will delete older version of a package. You should take care of version breaking changes related errors.

```
$ cd PROJECT_DIRECTORY
$ flatten
```

You can specify PROJECT_DIRECTORY to flatten

```
$ flatten PROJECT_DIRECTORY
```

PROJECT_DIRECTORY is a project directory, not a node_modules directory in PROJECT_DIRECTORY

## Automatic deployment

When using automated deployment which will execute `npm install` before running your nodejs script, you will need to somehow execute `flatten` after all dependencies are installed. 

## License

MIT
