/**
 * @file generate skeleton
 * @author panyuqi <panyuqi@baidu.com>
 */

const ssr = require('./ssr');
const insertAt = require('./util').insertAt;

class SkeletonPlugin {
    constructor(options = {}) {
        this.options = options;
    }

    apply(compiler) {
        let webpackConfig = this.options.webpackConfig;
        compiler.plugin('compilation', compilation => {

            compilation.plugin('html-webpack-plugin-before-html-processing', (htmlPluginData, callback) => {

                ssr(webpackConfig).then(({skeletonHtml, skeletonCss}) => {

                    // insert inlined styles into html
                    let headTagEndPos = htmlPluginData.html.lastIndexOf('</head>');
                    htmlPluginData.html = insertAt(htmlPluginData.html, `<style>${skeletonCss}</style>`, headTagEndPos);

                    // replace mounted point with ssr result in html
                    let appTemplate = '<div id="app">';
                    let appPos = htmlPluginData.html.lastIndexOf(appTemplate) + appTemplate.length;
                    htmlPluginData.html = insertAt(htmlPluginData.html, skeletonHtml, appPos);
                    callback(null, htmlPluginData);
                });
            });
        });
    }

    static loader({entry, routerEntry, options = {}}) {
        return {
            resource: routerEntry,
            loader: require.resolve('./loader'),
            options: Object.assign(options, {
                entry
            })
        };
    }
}

module.exports = SkeletonPlugin;
