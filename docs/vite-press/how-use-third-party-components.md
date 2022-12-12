# How to use third-party components - 如何使用第三方组件

> 这里以 [Arco Design](https://arco.design/) 组件库为例。

[[toc]]

### 安装依赖

首先，我们需要引入 Arco Design 组件库的依赖，按照其官方文档说明，运行以下命令（这里使用 yarn，更多请查阅：[快速上手](https://arco.design/vue/docs/start).

```bash
yarn add --dev @arco-design/web-vue
```

其次，在 Vite Press 中，需要在 Theme Configs 中引入第三方组件，具体做法为：

1. 创建文件`docs/.vitepress/theme/index.ts`
2. 像在 Vue 项目的入口文件 main.js 那样，引入第三方组件

  :::danger Arco 样式问题
  在使用 Arco 的过程中，由于忘记引入 CSS，显示就会错乱。
  :::

  ```ts
  // docs/.vitepress/theme/index.ts
  import DefaultTheme from 'vitepress/theme';

  /**
   * 使用 Arco 组件库
   * 请注意不要忘记引入 CSS 文件
   *
   * @link https://arco.design/vue/docs/start
   */
  import ArcoVue from "@arco-design/web-vue";
  import ArcoVueIcon from "@arco-design/web-vue/es/icon";
  import '@arco-design/web-vue/dist/arco.css';// required!!!
  
  export default {
    ...DefaultTheme,
    enhanceApp(ctx) {
      DefaultTheme.enhanceApp(ctx);
  
      // 引入第三方组件
      ctx.app.use(ArcoVue);
      ctx.app.use(ArcoVueIcon);
    }
  }
  ```

### 编写组件

由于在 Markdown 中编写过多 vue 代码会显得文件很乱，因此这里把**轮播图**封装为一个组件`docs/components/CarouselComponent.vue`。
该部分代码完全参照[Arco 关于轮播图的示例](https://arco.design/vue/component/carousel)，这里不再重复编写。

### 注册组件

组件需要注册才可以在其他页面使用，注册方法可查阅官方文档：[Registering global components in the theme](https://vitepress.vuejs.org/guide/using-vue#registering-global-components-in-the-theme).

于是自定义主题`docs/.vitepress/theme/index.ts`变成了如下样子：

```ts{13,30}
import DefaultTheme from 'vitepress/theme';

/**
 * 使用 Arco 组件库
 * 请注意不要忘记引入 CSS 文件
 *
 * @link https://arco.design/vue/docs/start
 */
import ArcoVue from "@arco-design/web-vue";
import ArcoVueIcon from "@arco-design/web-vue/es/icon";
import '@arco-design/web-vue/dist/arco.css';// required!!!

import CarouselComponent from '../../components/CarouselComponent.vue';

export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp(ctx);

    // 引入第三方组件
    ctx.app.use(ArcoVue);
    ctx.app.use(ArcoVueIcon);

    /**
     * 注册全局组件
     *
     * @link https://vitepress.vuejs.org/guide/using-vue#registering-global-components-in-the-theme
     * @see docs/vite-press/carousel.md
     */
    ctx.app.component('CarouselComponent', CarouselComponent);
  }
}
```

### 使用组件

全局注册组件后，可像在 Vue 文件中使用组件那样直接在 markdown 文件使用，例如：`<Carousel />`，即可展示 Carousel 组件中定义的内容。

效果如下：

![Use Carousel Component](assets/Use-Carousel-Component.png)
