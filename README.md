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

for (const token of tokenize(cssText)) {
  console.log(token) // logs an individual CSSToken
}
```

Tokenize CSS in _classical_ NodeJS:

```js
const { tokenizer } = require('@csstools/tokenizer')

let iterator = tokenizer(cssText), iteration

while (!(iteration = iterator()).done) {
  console.log(iteration.value) // logs an individual CSSToken
}
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

Tokenize CSS in _classical_ client-side scripts:

```html
<script src="http://unpkg.com/@csstools/tokenizer"></script>
<script>

const tokens = Array.from(tokenizeCSS(cssText)) // an array of CSSTokens

</script>
```

### Serialize tokens

```js
import { tokenize } from '@csstools/tokenizer'

let cssOutput = '';
for (const token of tokenize(cssText)) {
  // mutate some tokens

  cssOutput += token.lead + token.data + token.tail
}

console.log(cssOutput) // logs the CSS string
```

## How it works

The CSS tokenizer separates a string of CSS into tokens.

```ts
interface CSSToken {
  /** Position in the string at which the token was retrieved. */
  tick: number

  /** Number identifying the kind of token. */
  type:
    | 1 // Symbol
    | 2 // Comment
    | 3 // Space
    | 4 // Word
    | 5 // Function
    | 6 // Atword
    | 7 // Hash
    | 8 // String
    | 9 // Number
  
  /** Code, like the character code of a symbol, or the character code of the opening parenthesis of a function. */
  code: number

  /** Lead, like the opening of a comment, the quotation mark of a string, or the name of a function. */
  lead: string,

  /** Data, like the numbers before a unit, the word after an at-sign, or the opening parenthesis of a Function. */
  data: string,

  /** Tail, like the unit after a number, or the closing of a comment. */
  tail: string,
}
```

As an example, the CSS string `@media` would become a **Atword** token where `@` and `media` are recognized as distinct parts of that token. As another example, the CSS string `5px` would become a **Number** token where `5` and `px` are recognized as distinct parts of that token. As a final example, the string `5px 10px` would become 3 tokens; the **Number** as mentioned before (`5px`), a **Space** token that represents a single space (` `), and then another **Number** token (`10px`).

## Benchmarks

As of August 23, 2021, these benchmarks were averaged from my local machine:

```
Benchmark: Tailwind CSS
  ┌────────────────────────────────────────────────────┬───────┬────────┬────────┐
  │                      (index)                       │  ms   │ ms/50k │ tokens │
  ├────────────────────────────────────────────────────┼───────┼────────┼────────┤
  │ CSSTree 1 x 35.04 ops/sec ±6.55% (64 runs sampled) │ 28.54 │  1.51  │ 946205 │
  │ CSSTree 2 x 41.76 ops/sec ±7.57% (58 runs sampled) │ 23.95 │  1.27  │ 946205 │
  │ PostCSS 8 x 14.18 ops/sec ±3.31% (40 runs sampled) │ 70.54 │  3.77  │ 935282 │
  │ Tokenizer x 17.40 ops/sec ±0.98% (48 runs sampled) │ 57.48 │  3.04  │ 946206 │
  └────────────────────────────────────────────────────┴───────┴────────┴────────┘

Benchmark: Bootstrap
  ┌───────────────────────────────────────────────────┬──────┬────────┬────────┐
  │                      (index)                      │  ms  │ ms/50k │ tokens │
  ├───────────────────────────────────────────────────┼──────┼────────┼────────┤
  │ CSSTree 1 x 600 ops/sec ±0.87% (96 runs sampled)  │ 1.67 │  1.41  │ 59236  │
  │ CSSTree 2 x 695 ops/sec ±0.08% (100 runs sampled) │ 1.44 │  1.21  │ 59236  │
  │ PostCSS 8 x 432 ops/sec ±0.94% (94 runs sampled)  │ 2.31 │  2.26  │ 51170  │
  │ Tokenizer x 288 ops/sec ±0.40% (93 runs sampled)  │ 3.48 │  2.93  │ 59237  │
  └───────────────────────────────────────────────────┴──────┴────────┴────────┘
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
