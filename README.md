# CSS Tokenizer

[<img alt="npm version" src="https://img.shields.io/npm/v/@csstools/tokenizer.svg" height="20">](https://www.npmjs.com/package/@csstools/tokenizer)
[<img alt="build status" src="https://img.shields.io/travis/csstools/tokenizer/main.svg" height="20">](https://travis-ci.org/github/csstools/tokenizer)
[<img alt="code coverage" src="https://img.shields.io/codecov/c/github/csstools/tokenizer" height="20">](https://codecov.io/gh/csstools/tokenizer)
[<img alt="issue tracker" src="https://img.shields.io/github/issues/csstools/tokenizer.svg" height="20">](https://github.com/csstools/tokenizer/issues)
[<img alt="pull requests" src="https://img.shields.io/github/issues-pr/csstools/tokenizer.svg" height="20">](https://github.com/csstools/tokenizer/pulls)
[<img alt="support chat" src="https://img.shields.io/badge/support-chat-blue.svg" height="20">](https://gitter.im/postcss/postcss)

This tools lets you tokenize CSS according to the [CSS Syntax Specification](https://drafts.csswg.org/css-syntax/).
Tokenizing CSS is separating a string of CSS into its smallest distinct parts — otherwise known as tokens.

This tool is intended to be used in other tools on the front and back end. It seeks to maintain:

- 100% compliance with the CSS syntax specification. ✨
- 100% code coverage. 🦺
- 100% static typing. 💪
- 1kB maximum contribution size. 📦

## Usage

Add the [CSS tokenizer](https://github.com/csstools/tokenizer) to your project:

```shell
npm install @csstools/tokenizer
```

Tokenize a string of CSS:

```js
import { tokenize } from 'https://unpkg.com/@csstools/tokenizer'

const cssText = 'auto 50px'

tokenize(cssText, (token) => {
  // 1st time, `token` will represent the word "auto"
  // 2nd time, `token` will represent the space " "
  // 3rd time, `token` will represent the number "50px"
})
```

## How it works

The CSS tokenizer separates a string of CSS into tokens.
Each token is an object that represents information about a distinct part of the CSS.
Then token object includes a token **class**, an **enter** index, a **leave** index, and a **split** index.

```js
import { tokenize } from 'https://unpkg.com/@csstools/tokenizer'

const cssText = 'auto 50px'

tokenize(cssText, (token) => {
  console.log(
    token.class,
    token.enter,
    token.leave,
    token.split
  )
})
```

The value of **class** identifies the kind of token that has been consumed.

The value of **enter** identifies the position where the token begins.

The value of **leave** identifies the position where the token ends.

The value of **split** identifies the position where the token may be split into two smaller parts.
In a token representing `50px`, this is the position between `50` and `px`.
In a token representing `"string"`, this is the position between `"string` and `"`.
In a token representing `/* test */`, this is the position between `/* test ` and `*/`.

```ts
interface Token {
	token: number
	enter: number
	split: number
	leave: number
}
```

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

```shell
npm run build
```

### npm run test

The **test** command tests the coverage and accuracy of the tokenizer.

```shell
npm run test
```

### npm run benchmark

The **benchmark** command builds the project and then tests its performance as compared to [PostCSS].
These benchmarks are run against [Boostrap] and [Tailwind CSS].

```shell
npm run benchmark
```

[Boostrap]: https://getbootstrap.com
[PostCSS]: https://postcss.org
[Tailwind CSS]: https://tailwindcss.com
