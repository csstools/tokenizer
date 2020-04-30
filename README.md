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
