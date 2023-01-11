import {defineConfig} from "vitepress";

/**
 * @link https://vitepress.vuejs.org/config/app-configs
 * @link https://vitepress.vuejs.org/config/introduction
 */
export default defineConfig ({
    appearance: true,
    title: 'Learning',
    description: '文档库',
    base: '',
    lang: 'zh-CN',
    ignoreDeadLinks: true,
    lastUpdated: true,
    markdown: {
        theme: 'material-palenight',
        lineNumbers: true
    },
    /**
     * 定义文档目录位置
     */
    srcDir: './../docs',
    /**
     * 定义构建时输出目录
     */
    outDir: './../dist',

    cleanUrls: 'with-subfolders',

    themeConfig: {
        /**
         * 定义右侧导航菜单
         * @link https://vitepress.vuejs.org/guide/theme-nav#navigation-links
         */
        nav: [
            {
                text: 'Backend',
                items: [
                    {
                        text: 'ThinkPHP', link: '/backend/thinkphp',
                    },
                    {
                        text: 'Hyperf', link: '/backend/hyperf',
                    },
                    {
                        text: 'MongoDB', link: '/mongo/Get-started',
                    }
                ]
            },
            {
                text: 'Frontend',
                items: [
                    {
                        text: 'Vite Press', link: '/vite-press/index',
                    },
                    {
                        text: 'Use Third-Party Component', link: '/vite-press/how-use-third-party-components',
                    },
                    {
                        text: 'Carousel', link: '/vite-press/carousel',
                    },
                ]
            },
            {text: 'GitHub', link: 'https://github.com/linnzh'}
        ],
        /**
         * 定义侧边栏菜单
         * @link https://vitepress.vuejs.org/guide/theme-sidebar
         */
        sidebar: [
            {
                text: 'Works',
                items: [
                    {
                        text: 'Demo A', link: '/works/demo/a',
                    },
                    {
                        text: 'Demo B', link: '/works/demo/a',
                    },
                    {
                        text: 'Demo C', link: '/works/demo/a',
                    },
                ],
                collapsible: true,// 可展开/折叠
                collapsed: true,// 默认折叠
            }
        ],
        /**
         * 编辑链接
         * 可以跳转至 GitHub 当前内容的编辑界面
         * pattern 为 GitHub仓库地址/edit/当前目录/:path
         * 其中 :path 由 vite press 自动解析
         *
         * @link https://vitepress.vuejs.org/guide/theme-edit-link
         */
        editLink: {
            pattern: 'https://github.com/SimpleLearnCoding/simplelearncoding.github.io/edit/master/docs/:path',
            text: 'Edit this page on GitHub'
        },
        /**
         * 全局脚注
         *
         * Note that footer will not be displayed when the SideBar is visible.
         *
         * @link https://vitepress.vuejs.org/guide/theme-footer
         */
        footer: {
            message: 'Released under the <a href="https://github.com/SimpleLearnCoding/simplelearncoding.github.io/blob/master/LICENSE">MIT License</a>.',
            copyright: 'Copyright © 2022-present <a href="https://github.com/Linnzh">Linnzh</a>'
        },
    }
})