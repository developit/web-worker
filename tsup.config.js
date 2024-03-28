import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
	target: 'es2020',
	treeshake: false,
	splitting: false,
	entry: ['src/**/*.js'],
	format: ['cjs'],
	dts: false,
	minify: false,
	clean: false,
	shims: true,
	...options
}));
