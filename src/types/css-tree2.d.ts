declare module "css-tree2/tokenizer" {
	export function tokenize(
		css: string,
		onToken: (type: number, start: number, end: number) => void
	): void;
}
