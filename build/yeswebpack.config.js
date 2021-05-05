// webpack.config.js
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin')
const vueLoaderPlugin = require('vue-loader/lib/plugin')
const Webpack = require('webpack')

let indexLess = new ExtractTextWebpackPlugin('index.less');


module.exports = {
    mode: 'development', // 开发模式
    entry: {
        main: path.resolve(__dirname, '../src/main.js'),
    },
    output: {
        filename: '[name].[hash:8].js', // 打包后的文件名称
        path: path.resolve(__dirname, '../dist') // 打包后的目录
    },
    module: {
        rules: [{
                test: /\.vue$/,
                use: ['vue-loader']
            },
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env']
                        ]
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['css-loader']
            },
            {
                test: /\.less$/,
                use: indexLess.extract({
                    use: ['css-loader', {
                        loader: 'postcss-loader',
                        options: {
                            plugins: [require('autoprefixer')]
                        }
                    }, 'less-loader']
                })
            },
            ...fileLoadModule(['media', 'img', 'fonts'])
        ]
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.runtime.esm.js',
            ' @': path.resolve(__dirname, '../src')
        },
        extensions: ['*', '.js', '.json', '.vue']
    },
    devServer: {
        port: 3000,
        hot: true,
        contentBase: path.resolve(__dirname, '../dist')
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../public/index.html'),
            filename: path.resolve(__dirname, '../dist/index.html'),
            chunks: ['main'] //与文件入入口对应的模块名
        }),
        new vueLoaderPlugin(),
        new Webpack.HotModuleReplacementPlugin()
    ]
}

function fileLoadModule(arr, limit) {
    let moduleArr = [];
    let mimeReg = {
        'media': /\.(MP4|webm|ogg|mp3|wav|flac|aac)$/i,
        'img': /\.(jpe?g|png|gif)$/i,
        'fonts': /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
    }
    limit = limit | 10240;

    arr.forEach(element => {
        if (mimeReg[element]) {
            moduleArr.push({
                test: mimeReg[element], //字体文件匹配正则
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: limit,
                        fallback: {
                            loader: 'file-loader',
                            options: {
                                name: `${element}/[name].[hash:8].[ext]`
                            }
                        }
                    }
                }]
            })
        }
    });
    return moduleArr;
}