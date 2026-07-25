// webpack.config.js
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = function (options) {
  return {
    ...options,
    entry: './src/main.ts',
    target: 'node',
    externals: [nodeExternals()],
    module: {
      rules: [
        {
          test: /\.ts?$/,
          loader: 'ts-loader',
          exclude: /node_modules/,
          options: {
            transpileOnly: true,
          },
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
      alias: {
        '@': path.resolve(__dirname, 'src/'),
      },
    },
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'main.js',
    },
    // devtool: 'source-map',
  };
};
