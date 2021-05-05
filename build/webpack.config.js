const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const vueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const devMode = process.argv.indexOf('--mode=production') === -1;
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const Webpack = require('webpack');

let indexLess = new ExtractTextWebpackPlugin('index.less');

module.exports = {
    mode: 'development',
    entry: {
        main: path.resolve(__dirname, '../src/main.js'),
    },
    output: {
        path: path.resolve(__dirname, '../dist'), // 打包后的目录
        filename: '[name].[hash:8].js', // 打包后的文件名称
        chunkFilename: 'js/[name].[hash:8].js'
    },
    module: {
        rules: [{
                test: /\.vue$/,
                use: ['vue-loader']
            },
            {
                test: '/\.js$/',
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env']
                        ]
                    }
                },
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [{
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: '../dist/css/',
                            // hmr: devMode
                        }
                    },
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            postcssOptions: {
                                'autoprefixer': require('postcss-import'),
                                'autoprefixer': require('autoprefixer'),
                                'tailwindcss': require('tailwindcss'),
                            }
                        }
                    }
                ],
                //从右往左解析
            },
            {
                test: /\.less$/,
                use: indexLess.extract({
                    use: [

                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                publicPath: "../dist/css/",
                                // hmr: devMode
                            }
                        },
                        'css-loader', {
                            loader: 'postcss-loader',
                            options: {
                                postcssOptions: {
                                    plugins: [require('autoprefixer')]
                                }
                            }
                        }, 'less-loader'
                    ]
                })
            },
            ...fileLoadModule(['media', 'img', 'fonts'])
        ]
    },

    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.runtime.esm.js',
            '@': path.resolve(__dirname, '../src')
        },
        extensions: ['*', '.js', '.json', '.vue']
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../public/index.html'),
        }),
        new vueLoaderPlugin(),
        new MiniCssExtractPlugin({
            filename: devMode ? '[name].css' : '[name].[hash].css',
            chunkFilename: devMode ? '[id].css' : '[id].[hash].css'
        })
    ],


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