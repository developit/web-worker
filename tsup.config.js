import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
	target: 'es2020',
	treeshake: {
		preset: 'recommended'
	},
	splitting: false,
	entry: ['src/**/*.js'],
	format: ['cjs'],
	dts: false,
	minifySyntax: true,
	clean: false,
	shims: true,
	...options
}));
