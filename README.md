# CSS Tokenizer

[<img alt="npm version" src="https://img.shields.io/npm/v/@csstools/tokenizer.svg" height="20">](https://www.npmjs.com/package/@csstools/tokenizer)
[<img alt="build status" src="https://img.shields.io/travis/csstools/tokenizer/master.svg" height="20">](https://travis-ci.org/github/csstools/tokenizer)
[<img alt="code coverage" src="https://img.shields.io/codecov/c/github/csstools/tokenizer" height="20">](https://codecov.io/gh/csstools/tokenizer)
[<img alt="issue tracker" src="https://img.shields.io/github/issues/csstools/tokenizer.svg" height="20">](https://github.com/csstools/tokenizer/issues)
[<img alt="pull requests" src="https://img.shields.io/github/issues-pr/csstools/tokenizer.svg" height="20">](https://github.com/csstools/tokenizer/pulls)
[<img alt="support chat" src="https://img.shields.io/badge/support-chat-blue.svg" height="20">](https://gitter.im/postcss/postcss)

This tools lets you tokenize CSS according to the [CSS Syntax Specification](https://drafts.csswg.org/css-syntax/).
It works by separating a string of CSS into its smallest, semantic parts.
This is intended for use by other tools, in either the backend or the frontend, and it will contribute roughly 1kB of code.

## Usage

Add this [CSS tokenizer](https://github.com/csstools/tokenizer) to your project:

```sh
npm install @csstools/tokenizer
```

Use this tool to tokenizer your CSS in JavaScript:

```js
import cssTokenizer from '@csstools/tokenizer'

const tokens = Array.from(cssTokenizer(cssText))
```

Use this tool in classical NodeJS:

```js
const cssTokenizer = require('@csstools/tokenizer')

let iterator = cssTokenizer(cssText), iteration

while (!(iteration = iterator()).done) {
  console.log(iteration.value) // logs the token
}
```

Use this tool in scripts:

```html
<script type="module">
import cssTokenizer from "https://unpkg.com/@csstools/tokenizer?module"
cssTokenizer(cssText)
</script>
```

Use this tool in classical scripts:

```html
<script src="http://unpkg.com/@csstools/tokenizer"></script>
<script>
cssTokenizer(cssText)
</script>
```

## How it works

As an example, the string `@media` would become a **Name** token where `@` and `media` are recognized as distinct parts of that token. As another example, the string `5px` would become a **Number** token where `5` and `px` are recognized as distinct parts of that token. As a final example, the string `5px 10px` would become 3 tokens; the **Number** as mentioned before (`5px`), a **Space** token that represents a single space (` `), and then another **Number** token (`10px`).

An actual token is represented in a series of 5 items; 

```js
[ 0, -9, '', '100', '%' ] // CSS with a value of "100%"
```

The **first** number represents the position at which the token was read. The **second** number represents the type id of the token. The **third**, **fourth**, and **fifth** strings represent the text prefix, value, and suffix of the token.

## Benchmarks

As of September 26, 2020, these benchmarks were averaged from my local machine:

```
Benchmark: Tailwind CSS
  ┌──────────────────────────────────────────────────┬───────┬────────┬────────┐
  │                     (index)                      │  ms   │ ms/50k │ tokens │
  ├──────────────────────────────────────────────────┼───────┼────────┼────────┤
  │ PostCSS x 12.38 ops/sec ±3.33% (35 runs sampled) │ 80.79 │  6.97  │ 579896 │
  │ Develop x 12.07 ops/sec ±1.54% (34 runs sampled) │ 82.86 │  6.17  │ 670972 │
  └──────────────────────────────────────────────────┴───────┴────────┴────────┘
Benchmark: Bootstrap
  ┌────────────────────────────────────────────────┬──────┬────────┬────────┐
  │                    (index)                     │  ms  │ ms/50k │ tokens │
  ├────────────────────────────────────────────────┼──────┼────────┼────────┤
  │ PostCSS x 230 ops/sec ±0.50% (89 runs sampled) │ 4.35 │  4.37  │ 49807  │
  │ Develop x 142 ops/sec ±0.76% (80 runs sampled) │ 7.04 │  5.92  │ 59502  │
  └────────────────────────────────────────────────┴──────┴────────┴────────┘
```

## Contributing: Local Scripts

You want to take a deeper dive? Awesome! Here are a few useful development commands.

### npm run build

The **build** command creates all the files needed to run this tool in many different JavaScript environments.

```sh
npm run build
```

### npm run benchmark

The **benchmark** command builds the project and then tests its performance as compared to [PostCSS].
These benchmarks are run against [Boostrap] and [Tailwind CSS].

```sh
npm run benchmark
```

### npm run test

The **test** command tests the coverage and accuracy of the tokenizer.

As of September 26, 2020, this tokenizer has 100% test coverage:

```sh
npm run test
```

[Bootstrap]: https://getbootstrap.com
[PostCSS]: https://postcss.org
[Tailwind CSS]: https://tailwindcss.com
