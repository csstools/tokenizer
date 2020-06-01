# PostCSS Tokenizer

This repository contains an experimental tokenizer for PostCSS that follows the [CSS Syntax Specification](https://drafts.csswg.org/css-syntax/).

As of May 15, 2020, these benchmarks were averaged from my local machine:

```
PostCSS Tokenizer Development:       58721 tokens in 8 ms (1.0 times faster)
PostCSS Tokenizer Development (min): 58721 tokens in 8 ms (1.0 times faster)
PostCSS Tokenizer 7.0.31:            49548 tokens in 8 ms
```

## Collecting PostCSS Tokenizer Benchmarks

- Checkout this project
- From the project directory, run `npm test`.
- The resulting benchmarks of each tokenizer will be displayed.

## Creating PostCSS Tokenizer Tokens

- Checkout this project
- From the project directory, run `npm start`.
- The resulting tokens of each tokenizer will be put into a `results` directory.

## Playing with the experimental PostCSS Tokenizer

- Goto this [CodePen](https://codepen.io/jonneal/pen/YzyZwGj?editors=0100).
- Edit and style the CSS from within the CSS.

## Collecting PostCSS Parser Benchmarks

- Checkout this project
- From the project directory, run `npm run test:parser`.
- The resulting benchmarks of each parser will be displayed.

As of May 15, 2020, these benchmarks were taken from my local machine:

```
node run test && node run test-parser
```

```
Compressing PostCSS Tokenizer...

PostCSS Tokenizer Development:       1910 B
PostCSS Tokenizer Development (min):  638 B
PostCSS Tokenizer Development (web):  639 B

Collecting PostCSS Tokenizer Benchmarks...

PostCSS Tokenizer Development:       58721 tokens in 8 ms (1.0 times faster)
PostCSS Tokenizer Development (min): 58721 tokens in 8 ms (1.0 times faster)
PostCSS Tokenizer 7.0.31:            49548 tokens in 8 ms


Compressing PostCSS Parser...

PostCSS Parser Development:       1369 B
PostCSS Parser Development (min):  836 B
PostCSS Parser Development (web):  805 B

Collecting PostCSS Parser Benchmarks...

PostCSS Experimental Parser:       56024 nodes in 10 ms (1.6 times faster)
PostCSS Parser 7.0.31:              6240 nodes in 15 ms
PostCSS + Selector + Value Parser: 28491 nodes in 86 ms (5.5 times slower)
```

## Todo

- [ ] Test emojis, because rememebr 
- [ ] 
