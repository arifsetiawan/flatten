# This Project is Not Maintained Anymore

I am not working with Node.js nowadays, so I am not maintaining this module. Latest `npm` already flat dependencies by default and if you use latest Node.js version, you don't need `flatten-packages`.

# Flatten Packages

Flatten packages in node_modules

Nested node_modules are subjectively messy and sometimes we want it to be flat. Note that your node_modules might be exploded. Use it wisely.

## Installation

```
$ npm install -g flatten-packages
```

## How to use

Run executable `flatten-packages` to rearrange all packages in node_modules folder in the project directory. Flatten will delete older version of a package. You should take care of version breaking changes related errors.

```
$ cd PROJECT_DIRECTORY
$ flatten-packages
```

You can specify `PROJECT_DIRECTORY` to flatten

```
$ flatten-packages PROJECT_DIRECTORY
```

`PROJECT_DIRECTORY` is a project directory, not a node_modules directory in `PROJECT_DIRECTORY`

## Info mode

You can use info mode by adding `-i` to the command. It will list all duplicate packages. Info mode do not flatten `PROJECT_DIRECTORY`

```
$ flatten-packages PROJECT_DIRECTORY -i
```

## Print first level node_modules

Sometimes you need to fill dependency part of package.json. Use can use printed output using `-p`

```
$ flatten-packages PROJECT_DIRECTORY -p
```

## Automatic deployment

When using automated deployment which will execute `npm install` before running your nodejs script, you will need to somehow execute `flatten-packages` after all dependencies are installed. 

## License

MIT
