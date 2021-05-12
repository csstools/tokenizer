# CSS Tokenizer

[<img alt="npm version" src="https://img.shields.io/npm/v/@csstools/tokenizer.svg" height="20">](https://www.npmjs.com/package/@csstools/tokenizer)
[<img alt="build status" src="https://img.shields.io/travis/csstools/tokenizer/main.svg" height="20">](https://travis-ci.org/github/csstools/tokenizer)
[<img alt="code coverage" src="https://img.shields.io/codecov/c/github/csstools/tokenizer" height="20">](https://codecov.io/gh/csstools/tokenizer)
[<img alt="issue tracker" src="https://img.shields.io/github/issues/csstools/tokenizer.svg" height="20">](https://github.com/csstools/tokenizer/issues)
[<img alt="pull requests" src="https://img.shields.io/github/issues-pr/csstools/tokenizer.svg" height="20">](https://github.com/csstools/tokenizer/pulls)
[<img alt="support chat" src="https://img.shields.io/badge/support-chat-blue.svg" height="20">](https://gitter.im/postcss/postcss)

This tools lets you tokenize CSS according to the [CSS Syntax Specification](https://drafts.csswg.org/css-syntax/).
Tokenizing CSS is separating a string of CSS into its smallest, semantic parts — otherwise known as tokens.

This tool is intended to be used in other tools on the front and back end. It seeks to maintain:

- 100% compliance with the CSS syntax specification. ✨
- 100% code coverage. 🦺
- 100% static typing. 💪
- 1kB maximum contribution size. 📦
- Superior quality over Shark P. 🦈

## Usage

Add the [CSS tokenizer](https://github.com/csstools/tokenizer) to your project:

```sh
npm install @csstools/tokenizer
```

Tokenize CSS in JavaScript:

```js
import { tokenizer } from '@csstools/tokenizer'

const tokens = Array.from(tokenizer(cssText)) // an array of css tokens
```

Tokenize CSS in _classical_ NodeJS:

```js
const { tokenizer } = require('@csstools/tokenizer')

let iterator = tokenizer(cssText), iteration

while (!(iteration = iterator()).done) {
  console.log(iteration.value) // logs an individual css token
}
```

Tokenize CSS in client-side scripts:

```html
<script type="module">

import { tokenizer } from 'https://unpkg.com/@csstools/tokenizer?module'

const tokens = Array.from(tokenizer(cssText)) // an array of css tokens

</script>
```

Tokenize CSS in _classical_ client-side scripts:

```html
<script src="http://unpkg.com/@csstools/tokenizer"></script>
<script>

const tokens = Array.from(cssTokenizer(cssText)) // an array of css tokens

</script>
```

## How it works

The CSS tokenizer separates a string of CSS into tokens represented as an array.

```ts
[
  /** Position in the string at which the token was retrieved. */
  number,

  /** Number identifying the kind of token. */
  | -2 // Comment
  | -3 // Space
  | -4 // Identifier
  | -5 // Function
  | -6 // At-Identifier
  | -7 // Hash
  | -8 // String
  | -9 // Numeric
  | number // Delimiter (character code)
  ,

  /** Lead content, like the opening of a comment or the quotation mark of a string. */
  string,

  /** Main content, like the numbers before a unit, or the letters after an at-sign. */
  string,

  /** Tail content, like the unit of a number, or the closing of a comment. */
  string,
]
```

As an example, the string `@media` would become a **Name** token where `@` and `media` are recognized as distinct parts of that token. As another example, the string `5px` would become a **Number** token where `5` and `px` are recognized as distinct parts of that token. As a final example, the string `5px 10px` would become 3 tokens; the **Number** as mentioned before (`5px`), a **Space** token that represents a single space (` `), and then another **Number** token (`10px`).

An actual token is represented in a series of 5 items;

```js
[0, -9, '', '100', '%'] // CSS with a value of "100%"
```

The **first** number represents the position at which the token was read. The **second** number represents the type id of the token. The **third**, **fourth**, and **fifth** strings represent the text prefix, value, and suffix of the token.

## Benchmarks

As of May 11, 2021, these benchmarks were averaged from my local machine:

```
Benchmark: Tailwind CSS
  ┌──────────────────────────────────────────────────┬───────┬────────┬────────┐
  │                     (index)                      │  ms   │ ms/50k │ tokens │
  ├──────────────────────────────────────────────────┼───────┼────────┼────────┤
  │ PostCSS x 11.86 ops/sec ±2.64% (35 runs sampled) │ 84.31 │  4.52  │ 933299 │
  │ Develop x 14.98 ops/sec ±1.04% (42 runs sampled) │ 66.75 │  3.53  │ 946324 │
  └──────────────────────────────────────────────────┴───────┴────────┴────────┘

Benchmark: Bootstrap
  ┌────────────────────────────────────────────────┬──────┬────────┬────────┐
  │                    (index)                     │  ms  │ ms/50k │ tokens │
  ├────────────────────────────────────────────────┼──────┼────────┼────────┤
  │ PostCSS x 369 ops/sec ±0.12% (95 runs sampled) │ 2.71 │  2.77  │ 49006  │
  │ Develop x 272 ops/sec ±0.10% (93 runs sampled) │ 3.68 │  3.22  │ 57141  │
  └────────────────────────────────────────────────┴──────┴────────┴────────┘
```

## Development

You wanna take a deeper dive? Awesome! Here are a few useful development commands.

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

[Boostrap]: https://getbootstrap.com
[PostCSS]: https://postcss.org
[Tailwind CSS]: https://tailwindcss.com
