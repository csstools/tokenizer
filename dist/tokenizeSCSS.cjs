'use strict';

/**
 * Unicode Character Codes (0x0000 - 0x0080)
 * @see https://www.unicode.org/Public/UCD/latest/ucd/NamesList.txt
 * @see https://unicode.org/charts/nameslist/n_0000.html
 */ /** */

/** ␉ */
const CHARACTER_TABULATION = 0x0009;
/** ␊ */
const LINE_FEED = 0x000A;
/** ␌ */
const FORM_FEED = 0x000C;
/** ␍ */
const CARRIAGE_RETURN = 0x000D;

/**
 * ASCII punctuation and symbols
 * ===================================================================== */ /***/

/** ␠ */
const SPACE$1 = 0x0020;
/** " */
const QUOTATION_MARK = 0x0022;
/** # */
const NUMBER_SIGN = 0x0023;
/** $ */
const DOLLAR_SIGN = 0x0024;
/** ' */
const APOSTROPHE = 0x0027;
/** ( */
const LEFT_PARENTHESIS = 0x0028;
/** * */
const ASTERISK = 0x002A;
/** + */
const PLUS_SIGN = 0x002B;
/** - */
const HYPHEN_MINUS = 0x002D;
/** . */
const FULL_STOP = 0x002E;
/** / */
const SOLIDUS = 0x002F;

/*
 * ASCII digits
 * ========================================================================== */

/** 0 */
const DIGIT_ZERO = 0x0030;
/** 9 */
const DIGIT_NINE = 0x0039;
/** @ */
const COMMERCIAL_AT = 0x0040;

/**
 * Uppercase Latin alphabet
 * ===================================================================== */ /***/

/** A */
const LATIN_CAPITAL_LETTER_A = 0x0041;
/** E */
const LATIN_CAPITAL_LETTER_E = 0x0045;
/** Z */
const LATIN_CAPITAL_LETTER_Z = 0x005A;
/** \ */
const REVERSE_SOLIDUS = 0x005C;
/** _ */
const LOW_LINE = 0x005F;

/*
 * Lowercase Latin alphabet
 * ========================================================================== */

/** a */
const LATIN_SMALL_LETTER_A = 0x0061;
/** e */
const LATIN_SMALL_LETTER_E = 0x0065;
/** z */
const LATIN_SMALL_LETTER_Z = 0x007A;

/**
 * Non-ASCII
 * ===================================================================== */ /***/

/** � */
const NON_ASCII = 0x0080;

/** Returns whether the unicode value is a digit. [↗](https://drafts.csswg.org/css-syntax/#digit) */
const digit = code => code >= DIGIT_ZERO && code <= DIGIT_NINE;

/** Returns whether the unicode value is an identifier. [↗](https://drafts.csswg.org/css-syntax/#identifier-code-point) */
const identifier = code => identifierStart(code) || code >= DIGIT_ZERO && code <= DIGIT_NINE || code === HYPHEN_MINUS;

/** Returns whether the unicode value is an identifier-start. [↗](https://drafts.csswg.org/css-syntax/#identifier-start-code-point) */
const identifierStart = code => code === LOW_LINE || code >= NON_ASCII || code >= LATIN_CAPITAL_LETTER_A && code <= LATIN_CAPITAL_LETTER_Z || code >= LATIN_SMALL_LETTER_A && code <= LATIN_SMALL_LETTER_Z;

/** Returns whether the unicode value is a space. [↗](https://drafts.csswg.org/css-syntax/#whitespace) */
const space = code => code === CHARACTER_TABULATION || code === LINE_FEED || code === FORM_FEED || code === CARRIAGE_RETURN || code === SPACE$1;

/** Returns whether the unicode values are a valid escape. [↗](https://drafts.csswg.org/css-syntax/#starts-with-a-valid-escape) */
const validEscape = (code1of2, code2of2) => code1of2 === REVERSE_SOLIDUS && !space(code2of2);

/** [`<symbol-token>`](https://drafts.csswg.org/css-syntax/#typedef-delim-token) */
const SYMBOL = 0x0001;

/** [`<comment-token>`](https://drafts.csswg.org/css-syntax/#comment-diagram) */
const COMMENT = 0x0002;

/** [`<space-token>`](https://drafts.csswg.org/css-syntax/#whitespace-token-diagram) */
const SPACE = 0x0003;

/** [`<word-token>`](https://drafts.csswg.org/css-syntax/#ident-token-diagram) */
const WORD = 0x0004;

/** [`<function-token>`](https://drafts.csswg.org/css-syntax/#function-token-diagram) */
const FUNCTION = 0x0005;

/** [`<atword-token>`](https://drafts.csswg.org/css-syntax/#at-keyword-token-diagram) */
const ATWORD = 0x0006;

/** [`<hash-token>`](https://drafts.csswg.org/css-syntax/#hash-token-diagram) */
const HASH = 0x0007;

/** [`<string-token>`](https://drafts.csswg.org/css-syntax/#string-token-diagram) */
const STRING = 0x0008;

/** [`<number-token>`](https://drafts.csswg.org/css-syntax/#consume-numeric-token) */
const NUMBER = 0x0009;

/** [`<variable-token>`](https://sass-lang.com/documentation/variables) */
const VARIABLE = 0x0010;

const {
  fromCharCode
} = String;

/** Consumes and returns a token. [↗](https://drafts.csswg.org/css-syntax/#consume-token) */
const consume = state => {
  switch (true) {
    /* <comment-token>
    /* https://drafts.csswg.org/css-syntax/#consume-comment */
    case state.codeAt0 === SOLIDUS:
      if (state.codeAt1 === ASTERISK) return consumeCommentToken(state);
      break;
    /* <space-token>
    /* https://drafts.csswg.org/css-syntax/#whitespace-token-diagram */
    case space(state.codeAt0):
      return consumeSpaceToken(state);
    /* <string-token>
    /* https://drafts.csswg.org/css-syntax/#string-token-diagram */
    case state.codeAt0 === QUOTATION_MARK:
    case state.codeAt0 === APOSTROPHE:
      // "" || ''
      return consumeStringToken(state);
    /* <hash-token>
    /* https://drafts.csswg.org/css-syntax/#hash-token-diagram */
    case state.codeAt0 === NUMBER_SIGN:
      // #W
      if (identifier(state.codeAt1)) return {
        tick: state.tick,
        type: HASH,
        code: -1,
        lead: consumeAnyValue(state),
        data: consumeAnyValue(state) + consumeIdentifierValue(state),
        tail: ''
      };
      // #\:
      if (validEscape(state.codeAt1, state.codeAt2)) return {
        tick: state.tick,
        type: HASH,
        code: -1,
        lead: consumeAnyValue(state),
        data: consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
        tail: ''
      };
      break;
    /* <variable-token>
    /* https://sass-lang.com/documentation/variables */
    case state.codeAt0 === DOLLAR_SIGN:
      // $W
      if (identifier(state.codeAt1)) return {
        tick: state.tick,
        type: VARIABLE,
        code: -1,
        lead: consumeAnyValue(state),
        data: consumeAnyValue(state) + consumeIdentifierValue(state),
        tail: ''
      };
      // $\:
      if (validEscape(state.codeAt1, state.codeAt2)) return {
        tick: state.tick,
        type: VARIABLE,
        code: -1,
        lead: consumeAnyValue(state),
        data: consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
        tail: ''
      };
      break;
    /* <ident-token> */
    /* https://drafts.csswg.org/css-syntax/#ident-token-diagram */
    case state.codeAt0 === REVERSE_SOLIDUS:
      if (validEscape(state.codeAt0, state.codeAt1)) return consumeIdentifierLikeToken(state, {
        tick: state.tick,
        type: WORD,
        code: -1,
        lead: '',
        data: consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
        tail: ''
      });
      break;
    case identifierStart(state.codeAt0):
      // W
      return consumeIdentifierLikeToken(state, {
        tick: state.tick,
        type: WORD,
        code: -1,
        lead: '',
        data: consumeAnyValue(state) + consumeIdentifierValue(state),
        tail: ''
      });
    case state.codeAt0 === HYPHEN_MINUS:
      // -W
      if (state.codeAt1 === HYPHEN_MINUS || identifierStart(state.codeAt1)) return consumeIdentifierLikeToken(state, {
        tick: state.tick,
        type: WORD,
        code: -1,
        lead: '',
        data: consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
        tail: ''
      });
      // -\:
      if (validEscape(state.codeAt1, state.codeAt2)) return consumeIdentifierLikeToken(state, {
        tick: state.tick,
        type: WORD,
        code: -1,
        lead: '',
        data: consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
        tail: ''
      });
      /* <number-token> */
      /* https://drafts.csswg.org/css-syntax/#number-token-diagram */
      // -8
      if (digit(state.codeAt1)) return {
        tick: state.tick,
        type: NUMBER,
        code: -1,
        lead: '',
        data: consumeAnyValue(state) + consumeAnyValue(state) + consumeNumberSansAdditiveValue(state),
        tail: consumeNumericUnitValue(state)
      };
      // -.8
      if (state.codeAt1 === FULL_STOP && digit(state.codeAt2)) return {
        tick: state.tick,
        type: NUMBER,
        code: -1,
        lead: '',
        data: consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeNumberSansDecimalValue(state),
        tail: consumeNumericUnitValue(state)
      };
    case state.codeAt0 === FULL_STOP:
      // .8
      if (digit(state.codeAt1)) return {
        tick: state.tick,
        type: NUMBER,
        code: -1,
        lead: '',
        data: consumeAnyValue(state) + consumeAnyValue(state) + consumeNumberSansDecimalValue(state),
        tail: consumeNumericUnitValue(state)
      };
      break;
    case state.codeAt0 === PLUS_SIGN:
      // +8
      if (digit(state.codeAt1)) return {
        tick: state.tick,
        type: NUMBER,
        code: -1,
        lead: '',
        data: consumeAnyValue(state) + consumeAnyValue(state) + consumeNumberSansAdditiveValue(state),
        tail: consumeNumericUnitValue(state)
      };
      // +.8
      if (state.codeAt1 === FULL_STOP && digit(state.codeAt2)) return {
        tick: state.tick,
        type: NUMBER,
        code: -1,
        lead: '',
        data: consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeNumberSansDecimalValue(state),
        tail: consumeNumericUnitValue(state)
      };
      break;
    case digit(state.codeAt0):
      // 8
      return {
        tick: state.tick,
        type: NUMBER,
        code: -1,
        lead: '',
        data: consumeAnyValue(state) + consumeNumberSansAdditiveValue(state),
        tail: consumeNumericUnitValue(state)
      };
    /* <atident-token> */
    /* https://drafts.csswg.org/css-syntax/#at-keyword-token-diagram */
    case state.codeAt0 === COMMERCIAL_AT:
      if (state.codeAt1 === HYPHEN_MINUS) {
        // @--
        if (state.codeAt2 === HYPHEN_MINUS) return {
          tick: state.tick,
          type: ATWORD,
          code: -1,
          lead: consumeAnyValue(state),
          data: consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
          tail: ''
        };
        // @-W
        if (identifierStart(state.codeAt2)) return {
          tick: state.tick,
          type: ATWORD,
          code: -1,
          lead: consumeAnyValue(state),
          data: consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
          tail: ''
        };
        // @-\:
        if (validEscape(state.codeAt2, state.codeAt3)) return {
          tick: state.tick,
          type: ATWORD,
          code: -1,
          lead: consumeAnyValue(state),
          data: consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
          tail: ''
        };
      }
      // @W
      if (identifierStart(state.codeAt1)) return {
        tick: state.tick,
        type: ATWORD,
        code: -1,
        lead: consumeAnyValue(state),
        data: consumeAnyValue(state) + consumeIdentifierValue(state),
        tail: ''
      };
      // @\:
      if (validEscape(state.codeAt1, state.codeAt2)) return {
        tick: state.tick,
        type: ATWORD,
        code: -1,
        lead: consumeAnyValue(state),
        data: consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state),
        tail: ''
      };
      break;
  }
  /* <delim-token> */
  /* https://drafts.csswg.org/css-syntax/#typedef-delim-token */
  return {
    tick: state.tick,
    type: SYMBOL,
    code: state.codeAt0,
    lead: '',
    data: consumeAnyValue(state),
    tail: ''
  };
};

/** Consume and return a value. [↗](https://drafts.csswg.org/css-syntax/#consume-token) */
const consumeAnyValue = state => {
  const result = fromCharCode(state.codeAt0);
  state.next();
  return result;
};

/** Consume and return an identifier value. [↗](https://drafts.csswg.org/css-syntax/#consume-an-identifier) */
const consumeIdentifierValue = state => {
  let result = '';
  while (true) {
    switch (true) {
      case validEscape(state.codeAt0, state.codeAt1):
        result += fromCharCode(state.codeAt0);
        state.next();
      case identifier(state.codeAt0):
        result += fromCharCode(state.codeAt0);
        state.next();
        continue;
    }
    break;
  }
  return result;
};

/** Consume and return an identifier or function token. [↗](https://drafts.csswg.org/css-syntax/#consume-an-identifier) */
const consumeIdentifierLikeToken = (state, token) => {
  if (state.codeAt0 === LEFT_PARENTHESIS) {
    token.code = 40;
    token.type = FUNCTION;
    token.lead = token.data;
    token.data = '(';
    state.next();
  }
  return token;
};

/** Consume and return a comment token. [↗](https://drafts.csswg.org/css-syntax/#consume-comment) */
const consumeCommentToken = state => {
  const token = {
    tick: state.tick,
    type: COMMENT,
    code: -1,
    lead: '/*',
    data: '',
    tail: ''
  };
  state.next();
  state.next();
  while (state.tick < state.size) {
    // @ts-ignore
    if (state.codeAt0 === ASTERISK && state.codeAt1 === SOLIDUS) {
      token.tail = '*/';
      state.next();
      state.next();
      break;
    }
    token.data += consumeAnyValue(state);
  }
  return token;
};

/** Consumes and returns a space token. [↗](https://drafts.csswg.org/css-syntax/#whitespace-token-diagram) */
const consumeSpaceToken = state => {
  const token = {
    tick: state.tick,
    type: SPACE,
    code: -1,
    lead: '',
    data: consumeAnyValue(state),
    tail: ''
  };
  while (state.tick < state.size) {
    if (!space(state.codeAt0)) break;
    token.data += consumeAnyValue(state);
  }
  return token;
};

/** Consumes and returns a string token. [↗](https://drafts.csswg.org/css-syntax/#string-token-diagram) */
const consumeStringToken = state => {
  const {
    codeAt0
  } = state;
  const token = {
    tick: state.tick,
    type: STRING,
    code: -1,
    lead: '',
    data: consumeAnyValue(state),
    tail: ''
  };
  while (state.tick < state.size) {
    switch (true) {
      case validEscape(state.codeAt0, state.codeAt1):
        token.data += consumeAnyValue(state);
      default:
        token.data += consumeAnyValue(state);
        continue;
      case state.codeAt0 === codeAt0:
        token.tail = consumeAnyValue(state);
    }
    break;
  }
  return token;
};

/** Consumes and returns a number value after an additive symbol. [↗](https://drafts.csswg.org/css-syntax/#consume-a-number) */
const consumeNumberSansAdditiveValue = state => {
  let result = '';
  result += consumeDigitValue(state);
  if (state.codeAt0 === FULL_STOP && digit(state.codeAt1)) result += consumeAnyValue(state) + consumeAnyValue(state) + consumeDigitValue(state);
  return result + consumeNumberSansDecimalValue(state);
};

/** Consumes and returns a number value after a decimal place. [↗](https://drafts.csswg.org/css-syntax/#consume-a-number) */
const consumeNumberSansDecimalValue = state => {
  let result = '';
  result += consumeDigitValue(state);
  if (state.codeAt0 === LATIN_CAPITAL_LETTER_E || state.codeAt0 === LATIN_SMALL_LETTER_E) {
    switch (true) {
      case state.codeAt1 === PLUS_SIGN || state.codeAt1 === HYPHEN_MINUS:
        if (!digit(state.codeAt2)) break;
        result += consumeAnyValue(state);
      case digit(state.codeAt1):
        result += consumeAnyValue(state) + consumeAnyValue(state) + consumeDigitValue(state);
    }
  }
  return result;
};

/** Consumes and returns a digit value. [↗](https://drafts.csswg.org/css-syntax/#consume-a-number) */
const consumeDigitValue = state => {
  let result = '';
  while (state.tick < state.size) {
    if (!digit(state.codeAt0)) break;
    result += consumeAnyValue(state);
  }
  return result;
};

/** Consumes and returns a numeric unit value. [↗](https://drafts.csswg.org/css-syntax/#consume-an-identifier) */
const consumeNumericUnitValue = state => state.codeAt0 === HYPHEN_MINUS ? state.codeAt1 === HYPHEN_MINUS ? consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state) : identifierStart(state.codeAt1) ? consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state) : validEscape(state.codeAt1, state.codeAt2) ? consumeAnyValue(state) + consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state) : '' : identifierStart(state.codeAt0) ? consumeAnyValue(state) + consumeIdentifierValue(state) : validEscape(state.codeAt0, state.codeAt1) ? consumeAnyValue(state) + consumeAnyValue(state) + consumeIdentifierValue(state) : '';

/** Returns a CSS iterator to yield tokens from the given CSS data. */
const tokenize = data => {
  let size = data.length;
  let tick = 0;

  /** Condition of the current tokenizer. */
  let state = {
    data,
    size,
    tick,
    codeAt0: tick + 0 < size ? data.charCodeAt(tick + 0) : -1,
    codeAt1: tick + 1 < size ? data.charCodeAt(tick + 1) : -1,
    codeAt2: tick + 2 < size ? data.charCodeAt(tick + 2) : -1,
    codeAt3: tick + 3 < size ? data.charCodeAt(tick + 3) : -1,
    /** Advances the unicode characters being read from the CSS data by one position. */
    next() {
      state.tick = ++tick;
      state.codeAt0 = state.codeAt1;
      state.codeAt1 = state.codeAt2;
      state.codeAt2 = state.codeAt3;
      state.codeAt3 = tick + 3 < size ? data.charCodeAt(tick + 3) : -1;
      return tick >= size;
    }
  };

  /** Returns the most recent state and token yielded from the CSS iterator. */
  const iterator = () => state.tick >= state.size ? {
    done: true,
    value: {
      tick: state.tick,
      type: 0,
      code: -2,
      lead: '',
      data: '',
      tail: ''
    }
  } : {
    done: false,
    value: consume(state)
  };
  iterator[Symbol.iterator] = () => ({
    next: iterator
  });
  return iterator;
};

exports.tokenize = tokenize;
//# sourceMappingURL=tokenizeSCSS.cjs.map
