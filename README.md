# Laravel Mix Ziggy Watch

Laravel Mix extension which adds support for building your Ziggy routes file during mixing as well as automatic rebuilding when in `--watch` mode.

## Installation

```sh
npm i laravel-mix-ziggy-watch
```
or
```sh
yarn add laravel-mix-ziggy-watch
```

## Usage
```js
const mix = require("laravel-mix");
require("laravel-mix-ziggy-watch");

mix.js("resources/js/app.js", "public/js").ziggyWatch({});

```

## Configuration
You can pass config options to the `ziggyWatch` method in your mix file.


| name           | type                 | required | description                                                          | default                 |
| -------------- | -------------------- | -------- | -------------------------------------------------------------------- | ----------------------- |
| watch          | string/array/boolean | no       | Paths to files, dirs to be watched recursively, or glob patterns. `false` to disable watch     | ["routes/**/*.php"] |
| output         | string               | no       | The output path of your generated routes file, relative to root dir  | "resources/js/ziggy.js" |
| production     | boolean              | no       | Enable build/watch in production mode                                | true                    |
| development    | boolean              | no       | Enable build/watch in development mode                               | true                    |