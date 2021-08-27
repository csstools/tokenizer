# Changes to CSS Tokenizer

### 3.1.0 (August 27, 2021)

- Added SCSS tokenization as `@csstools/tokenizer/tokenizeSCSS`.

### 3.0.0 (August 23, 2021)

- Changes the shape of tokens from an array to an object.
- Changes the named export from `tokenizer` to `tokenize`.
- Changes the global IIFE export from `cssTokenizer` to `tokenizeCSS`.

### 2.0.2 (August 22, 2021)

- Fixes an issue consuming digits after a number that begins with a decimal.

### 2.0.1 (May 11, 2021)

- Fixes an issue where string tokens incorrectly put the lead quotation in the main value.

### 2.0.0 (May 11, 2021)

- Supports function token (previously an identifier token followed by a parenthesis delimiter token).
- Changes from default export to named export (`tokenizer`).

### 1.0.0 (September 26, 2020)

Initial version
