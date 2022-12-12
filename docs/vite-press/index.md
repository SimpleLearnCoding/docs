---
title: Markdown demo 
lang: zh-CN 
editLink: true

prev: 'Get Started' 
next: 'Demo'

---

# Hello Vite Press

> For more Markdown syntax see: [Markdown Extensions](https://vitepress.vuejs.org/guide/markdown)


[[toc]]

## Container Box

::: info This is an info box.[Gray]

There are other types of boxes: Tip, warning, danger, details.
:::

## Syntax Highlighting

```typescript
export default {
    data() {
        return {
            msg: 'Highlighted!'
        }
    }
}
```

```typescript{4}
export default {
  data () {
    return {
      msg: 'Highlighted!', // Highlight the current row
    }
  }
}
```

See more usage: [Focus in code blocks](https://vitepress.vuejs.org/guide/markdown#focus-in-code-blocks).

## I want to show my work <Badge type="tip" text="done" />

<CarouselComponent></CarouselComponent>

## Badge

> See more details: [Theme badge](https://vitepress.vuejs.org/guide/theme-badge)

### Demo <Badge type="tip" text="official" />

```js
<Badge type="tip" text="official"/>
```
