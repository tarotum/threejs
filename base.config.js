const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: './src/index.js',
	output: {
		path: path.resolve(__dirname, 'build'),
		publicPath: '/',
		filename: 'js/bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['es2015']
					}
				}
			},
			{
				test: /\.(png|jp(e*)g|gif|svg,tga)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: 'img/[name].[ext]'
						}
					}
				]
			},
			{
				test: /\.obj$/,
				loader: 'webpack-obj-loader'
			},
			{
				test: /\.fbx$/,
				use: [
					{
						loader: 'url-loader',
						options: {
							limit: 8192
						}
					}
				]
			},
			{
				test: /.(ttf|otf|eot|woff(2)?)(\?[a-z0-9]+)?$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: 'fonts/[name].[ext]'
						}
					}
				]
			}
		]
	},
	plugins: [
		new webpack.EnvironmentPlugin(['NODE_ENV']),
		new webpack.ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery',
			'window.jQuery': 'jquery'
		}),
		new HtmlWebpackPlugin({
			filename: path.resolve(__dirname, 'build/index.html'),
			template: path.resolve(__dirname, 'src/index.html')
		})
	],
	resolve: {
		alias: {
			Static: path.resolve(__dirname, 'src/static')
		}
	}
};
