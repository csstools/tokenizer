# PostCSS Tokenizer

This repository contains an experimental tokenizer for PostCSS that follows the [CSS Syntax Specification](https://drafts.csswg.org/css-syntax/).

As of April 30, 2020, these benchmarks were averaged from my local machine:

```
PostCSS Tokenizer 7.0.27:            49548 tokens in 10 ms
PostCSS Tokenizer Development (min): 60458 tokens in 14 ms (1.4 times slower)
PostCSS Tokenizer Development:       60458 tokens in 18 ms (1.8 times slower)
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

As of May 13, 2020, these benchmarks were taken from my local machine:

```
node run test && node run test-parser
```

```
Compressing PostCSS Tokenizer...

PostCSS Tokenizer Development:       1541 B
PostCSS Tokenizer Development (min):  671 B
PostCSS Tokenizer Development (web):  662 B

Collecting PostCSS Tokenizer Benchmarks...

PostCSS Tokenizer 7.0.29:            49548 tokens in  9 ms
PostCSS Tokenizer Development:       60551 tokens in 16 ms (1.7 times slower)
PostCSS Tokenizer Development (min): 60551 tokens in 16 ms (1.7 times slower)


Compressing PostCSS Parser...

PostCSS Parser Development:       1250 B
PostCSS Parser Development (min):  795 B
PostCSS Parser Development (web):  767 B

Collecting PostCSS Parser Benchmarks...

PostCSS Parser 7.0.29:              1204 nodes in 14 ms
PostCSS Experimental Parser:       13686 nodes in 17 ms (1.2 times slower)
PostCSS + Selector + Value Parser:  1204 nodes in 78 ms (5.5 times slower)
```
