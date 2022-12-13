import DefaultTheme from 'vitepress/theme';

/**
 * 使用 Arco 组件库
 * 请注意不要忘记引入 CSS 文件
 *
 * @link https://arco.design/vue/docs/start
 */
import ArcoVue from "@arco-design/web-vue";
// import ArcoVueIcon from "@arco-design/web-vue/es/icon";
import '@arco-design/web-vue/dist/arco.css'; // required!!!
import CarouselComponent from '../../components/CarouselComponent.vue';

export default {
  ...DefaultTheme,
  enhanceApp(ctx) {
    DefaultTheme.enhanceApp(ctx);

    // 引入第三方组件
    ctx.app.use(ArcoVue);
    // ctx.app.use(ArcoVueIcon);

    /**
     * 注册全局组件
     *
     * @link https://vitepress.vuejs.org/guide/using-vue#registering-global-components-in-the-theme
     * @see docs/vite-press/carousel.md
     */
    ctx.app.component('CarouselComponent', CarouselComponent);
  }
}
