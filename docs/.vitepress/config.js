/**
 * @link https://vitepress.vuejs.org/config/app-configs
 */
export default {
    appearance: true,
    title: 'Docs of linnzh',
    description: '文档库',
    base: '',
    lang: 'zh-CN',
    ignoreDeadLinks: true,
    lastUpdated: true,
    markdown: {
        theme: 'material-palenight',
        lineNumbers: true
    },
    outDir: './.vitepress/dist',
    cleanUrls: 'with-subfolders'
}
