module.exports = {
	mode: 'development',
	entry: [
	  './client/game.js'
	],
	output: {
	  path: __dirname,
	  filename: './public/bundle.js'
	},
	devtool: 'source-map',
	module: {
	  rules: [
		{
		  test: /\.jsx?$/,
		  exclude: /node_modules/,
		},
		{
		  test: /\.css$/,
		  use: [
			'style-loader',
			'css-loader',
		  ]
		}
	  ]
	}
  }