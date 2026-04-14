import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import scss from 'rollup-plugin-scss';
import sass from 'sass';

export default args => ({
  input: 'src/main.ts',
  external: ['three', /^three\/examples\/jsm\//],
  output: {
    file: args['config-prod'] ? 'dist/index.min.js' : 'index.js',
    format: 'es',
    plugins: args['config-prod']
      ? [
          terser({
            safari10: false,
            output: { comments: false },
          }),
        ]
      : [],
  },
  plugins: [
    resolve(),
    typescript(),
    commonjs(),
    scss({
      include: ['scss/*'],
      output: args['config-prod'] ? './dist/style.min.css' : './style.css',
      runtime: sass,
      silenceDeprecations: ['legacy-js-api', 'import', 'global-builtin', 'color-functions', 'mixed-decls'],
      ...(args['config-prod'] ? { outputStyle: 'compressed' } : {}),
    }),
  ],
});
