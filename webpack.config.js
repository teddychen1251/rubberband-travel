module.exports = {
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: 'ts-loader'
        }]
    },
    devServer: {
        compress: true,
        disableHostCheck: true
    },
    node: {
        fs: 'empty'
    }
}


