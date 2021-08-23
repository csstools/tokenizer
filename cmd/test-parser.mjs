import { parser } from '../dist/parser.mjs'

const css = `:where(.c-sitenav a) {
	align-items: center;
	color: inherit;
	display: flex;
	font-size: 18rx;
	line-height: calc(22 / 18);
	padding-inline: 40rx;
	text-decoration: none;
}
`

const ast = parser(css)

for (const value of ast) {
	console.log(value, [ String(value) ])
}

void ast
