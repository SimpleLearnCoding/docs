# Docs - by Vite Press

> [Vite Press Getting Started](https://vitepress.vuejs.org/guide/getting-started)

## Usage

> 以部署在 GitHub 为例。

### vite 构建配置

请参考：[Configuration](https://vitepress.vuejs.org/guide/configuration)

### GitHub Action 配置

请参考[Deploying](https://vitepress.vuejs.org/guide/deploying)配置 GitHub workflow 文件。

#### 注意事项

1. GitHub 目前仅支持与**用户/组织**同名的仓库发布
   Page，具体可查看：[About GitHub Pages](https://docs.github.com/cn/pages/getting-started-with-github-pages/about-github-pages)
   . 这里以`simplelearncoding.github.io`为例。如需更多支持，可以自行创建 organization。
2. `docs/.vitepress/config.js` 中的`base`属性应该为`''`，而不是其他。
