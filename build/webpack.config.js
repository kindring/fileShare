const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
let indexLess = new ExtractTextWebpackPlugin('index.less');
let indexCss = new ExtractTextWebpackPlugin('index.css');


module.exports = {
    mode: 'development',
    entry: {
        main: path.resolve(__dirname, '../src/main.js'),
    },
    output: {
        filename: '[name].[hash:8].js', // 打包后的文件名称
        path: path.resolve(__dirname, '../dist') // 打包后的目录
    },

    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../public/index.html'),
            filename: path.resolve(__dirname, '../dist/views/main.html'),
            chunks: ['main'] //与文件入入口对应的模块名
        }),
        indexLess,
        indexCss
    ],

    module: {
        rules: [{
                test: /\.css$/,
                use: [
                        indexCss.extract({
                            use: ['css-loader']
                        }),
                    ] //从右往左解析
            },
            {
                test: /\.less$/,
                use: indexLess.extract({
                    use: ['css-loader', 'less-loader']
                })
            },
            ...fileLoadModule(['media', 'img', 'fonts'])
        ]
    },
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