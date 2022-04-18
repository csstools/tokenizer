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
import { tokenize } from '@csstools/tokenizer'

tokenize(cssText, (token) => {
  console.log(token) // logs an individual CSSToken
})
```

Tokenize CSS in _classical_ NodeJS:

```js
const { tokenizer } = require('@csstools/tokenizer')

tokenize(cssText, (token) => {
  console.log(token) // logs an individual CSSToken
})
```

Tokenize CSS in client-side scripts:

```html
<script type="module">

import { tokenize } from 'https://unpkg.com/@csstools/tokenizer?module'

for (const token of tokenize(cssText)) {
  console.log(token) // logs an individual CSSToken
}

</script>
```

## How it works

The CSS tokenizer separates a string of CSS into tokens.

```ts
interface CSSToken {
  /** Position in the string at which the token was retrieved. */
  tick: number

  /** Number identifying the kind of token; or the character code of a symbol. */
  type: number

  /** Data, the number of characters in the token. */
  data: number,

  /** Tail, the number of characters in a unit after a number, or in the closing of a comment. */
  edge: string,
}
```

As an example, the CSS string `@media` would become a **Atword** token where `@` and `media` are recognized as distinct parts of that token. As another example, the CSS string `5px` would become a **Number** token where `5` and `px` are recognized as distinct parts of that token. As a final example, the string `5px 10px` would become 3 tokens; the **Number** as mentioned before (`5px`), a **Space** token that represents a single space (` `), and then another **Number** token (`10px`).

## Benchmarks

As of April 11, 2022, these benchmarks were reported from my local machine:

```
Benchmark: Tailwind CSS
  ┌────────────────────────────────────────────────────┬───────┬────────┬────────┐
  │                      (index)                       │  ms   │ ms/50k │ tokens │
  ├────────────────────────────────────────────────────┼───────┼────────┼────────┤
  │ CSSTree 1 x 35.86 ops/sec ±6.82% (65 runs sampled) │ 27.88 │  1.47  │ 946205 │
  │ CSSTree 2 x 43.15 ops/sec ±7.57% (60 runs sampled) │ 23.17 │  1.22  │ 946205 │
  │ PostCSS 8 x 14.82 ops/sec ±2.33% (42 runs sampled) │ 67.46 │  3.61  │ 935282 │
  │ CSS Tools x 36.76 ops/sec ±0.14% (65 runs sampled) │ 27.2  │  1.44  │ 946205 │
  └────────────────────────────────────────────────────┴───────┴────────┴────────┘

Benchmark: Bootstrap CSS
  ┌──────────────────────────────────────────────────┬──────┬────────┬────────┐
  │                     (index)                      │  ms  │ ms/50k │ tokens │
  ├──────────────────────────────────────────────────┼──────┼────────┼────────┤
  │ CSSTree 1 x 608 ops/sec ±0.26% (97 runs sampled) │ 1.65 │  1.38  │ 59543  │
  │ CSSTree 2 x 702 ops/sec ±0.16% (97 runs sampled) │ 1.42 │  1.2   │ 59543  │
  │ PostCSS 8 x 440 ops/sec ±0.10% (94 runs sampled) │ 2.27 │  2.21  │ 51453  │
  │ CSS Tools x 623 ops/sec ±0.15% (97 runs sampled) │ 1.61 │  1.35  │ 59543  │
  └──────────────────────────────────────────────────┴──────┴────────┴────────┘
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

As of April 18, 2022, this tokenizer maintains 100% test coverage:

```sh
npm run test
```

[Boostrap]: https://getbootstrap.com
[PostCSS]: https://postcss.org
[Tailwind CSS]: https://tailwindcss.com
