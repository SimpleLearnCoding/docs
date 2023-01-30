# Vite Press build error



> 记一次使用 GitHub Action 构建 Vite Press 项目时遇到的错误。



## 前情



笔者使用 Vite Press 搭建了一个个人博客，配合 GitHub Action 的自动部署。前几天还在正常运行，在昨天突然发现构建失败了，进入 Actions 查看构建过程发现以下报错：

```bash
Run yarn docs:build
##[debug]/usr/bin/bash -e /home/runner/work/_temp/bcd14533-9b56-4c8f-8151-9c8931e25bd4.sh
yarn run v1.22.19
warning package.json: License should be a valid SPDX license expression
$ vitepress build config
vitepress v1.0.0-alpha.43
- building client + server bundles...
✖ building client + server bundles...
build error:
 [Error: ENOENT: no such file or directory, open '/home/runner/work/simplelearncoding.github.io/simplelearncoding.github.io/node_modules/shiki/themes/material-palenight.json'] {
  errno: -2,
  code: 'ENOENT',
  syscall: 'open',
  path: '/home/runner/work/simplelearncoding.github.io/simplelearncoding.github.io/node_modules/shiki/themes/material-palenight.json'
}
error Command failed with exit code 1.
```



其关键报错信息：`ENOENT: no such file or directory, open '/home/runner/work/simplelearncoding.github.io/simplelearncoding.github.io/node_modules/shiki/themes/material-palenight.json']`提示文件不存在。



## 本地排查



为此笔者立刻查看了自己本地项目`node_modules`目录下是否存在该文件，结果是存在的。



> 在写本文时，笔者突然就发现了这个错误最根本的地方在于 vitepress v1.0.0-alpha.43 版本与`package.json`中定义的并不一致。
>
> 但由于对前端包版本控制系统的不了解，以及对著名项目的信任，无法往「版本兼容性」方向想——毕竟，谁会想到只是小版本的更新也会导致问题呢？



### 未安装依赖？



随后想到可能是 GitHub Action 安装依赖不完整，于是将`.github/workflows/deploy.yml`流水线部署文件中关于`yarn install`的部分，改为了`yarn install --no-lockfile`。



此时并没有 push 至 GitHub 进行测试，而是删除了本地项目的`node_modules`目录，并运行命令`yarn install --no-lockfile`。结果连`yarn docs:dev`命令也无法运行，报错信息同上。



在这个过程中，还遇到了一些问题。



## 容器排查



在本地始终无法复现该问题时，我想起前段时间运行公司前端项目一直失败的事情，前端同学认为我的「Node 版本过高」。

使用`node -v`检查了一下，发现是 19.x 版本，而对方使用的是 16.x。遂琢磨着使用**Docker容器**来构建项目。



### Node Alpine 镜像问题



在 Docker 的使用方面，我一直倾向于使用**Alpine**版本。在执行`yarn docs:dev`时没有报错，而后执行`yarn docs:build`时，引发错误：

```shell
/opt/www # yarn docs:build

$ vitepress build config
vitepress v1.0.0-alpha.43
⠦ building client + server bundles...[vitepress] spawn git ENOENT
file: /opt/www/docs/db/redis-basic.md
✖ building client + server bundles...
build error:
 Error: spawn git ENOENT
    at Process.ChildProcess._handle.onexit (node:internal/child_process:285:19)
    at onErrorNT (node:internal/child_process:485:16)
    at processTicksAndRejections (node:internal/process/task_queues:83:21) {
  errno: -2,
  code: 'PLUGIN_ERROR',
  syscall: 'spawn git',
  path: 'git',
  spawnargs: [ 'log', '-1', '--pretty="%ci"', '/opt/www/docs/db/redis-basic.md' ],
  pluginCode: 'ENOENT',
  plugin: 'vitepress',
  hook: 'transform',
  id: '/opt/www/docs/db/redis-basic.md'
```

很轻易地，我的注意力被其所提示的文件吸引，猜测**可能是文件的格式语法不支持**（因为之前出现过因为 markdown 代码块语法不支持某个语言的报错）。

花时间去检查 markdown 语法后，重新执行 build 命令，报错信息还是如此。

意识到方向出了问题，遂 Google，得知是**缺少`git`**。

我当时无法置信，为何一个前端项目构建过程会用到 git 版本控制？但事实上它就是需要。我没去刨根问底，只是默默`apt add git`了一下。



### 其他问题



安装 git 后，执行 build 命令，它告诉我渲染页面时出现了问题：



```shell
✖ rendering pages...
build error:
 TypeError: Cannot read properties of undefined (reading 'replace')
    at normalizeLink$1 (file:///opt/www/config/.vitepress/.temp/app.js:398:91)
    at file:///opt/www/config/.vitepress/.temp/app.js:3241:92
    at renderComponentSubTree (/opt/www/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:251:17)
    at renderComponentVNode (/opt/www/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:185:16)
    at ssrRenderComponent (/opt/www/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:621:12)
    at file:///opt/www/config/.vitepress/.temp/app.js:3358:13
    at renderComponentSubTree (/opt/www/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:251:17)
    at renderComponentVNode (/opt/www/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:185:16)
    at ssrRenderComponent (/opt/www/node_modules/@vue/server-renderer/dist/server-renderer.cjs.prod.js:621:12)
    at file:///opt/www/config/.vitepress/.temp/app.js:3442:15
error Command failed with exit code 1.
```



并且还在`.vitepress`目录下生成了`.temp`的缓存目录。



我只得删除所有依赖和缓存文件，再次执行安装依赖命令`yarn install --no-lockfile`。



安装完毕后 webstorm 提示我配置文件`config/.vitepress/config.ts`存在致命错误：

`cleanUrls`选项只能是 Boolean 类型，而我写的是`cleanUrls: 'with-subfolders'`。

查看其声明，webstorm 提示的确实没错。于是去翻 vite press 的官方说明，也确实如此。

问题是，vite press 配置基本是我复制其官方而来。

**此刻我才注意到官方版本好像与项目中`package.json`中定义的并不一致**（`1.0.0-alpha.31`和`1.0.0-alpha.43`）。



#### 修改版本



无法，只能修改依赖：



```diff
- "vitepress": "^1.0.0-alpha.31",
+ "vitepress": "1.0.0-alpha.31",
```



重新安装依赖并构建后，问题解决。



## 更多的坑



问题排查过程中，还遇到以下问题。



### Cannot find module



webstorm 在文件`config/.vitepress/theme/index.ts`的两条导入语句上报错：`Cannot find module 'vitepress/theme' or its corresponding type declarations`。



该报错由`tsc`提出，项目本身是没有安装`tslint`的。

开始怀疑是*依赖不全*，但点进去文件又是存在的，遂排除；

进而猜测是 *IDE 本身的错误检查*太严格了，但一项项看过去，也没有找到符合的配置，遂排除；

最后意识到可能是 Typescript 的问题（毕竟是它提出来的）。



经过排查上面的问题后，现在至少有个**环境意识**了：这个 typescript 必定是 IDE 上的。

果不其然，ts 本地并未安装（`npm ls typescript -g`命令查看全局安装的 ts）。

在将 IDE 关于**解释器**的配置中可以看到绑定（Bundle）Typescript 版本为 4.2.2，而 Node 版本为 19.1.0。

修改 Node 16.x 版本后，该问题消失。



我不清楚 node 19.x 版本是否不兼容 4.2.2 版本的 Typescript。但为了尽量避免此类错误，我选择在`package.json`中加上`typescript`依赖，以及声明 Node 版本：

```diff
+  "engines": {
+    "node": ">=14.0.0"
+  },
   "devDependencies": {
     "@arco-design/web-vue": "^2.40.0",
+    "typescript": "^4.9.4",
     "vitepress": "1.0.0-alpha.31",
     "vue": "^3.2.45"
   },
```



::: tip 

1. 经测试，node 19.x 版本是兼容 4.9.4 版本的 Typescript 的。

2. 始终推荐「次稳定版本」的 Node，并在项目中使用 yarn 维护依赖项。

:::



### License should be a valid SPDX license expression



该错误是在安装依赖时给出的警告，好奇`SPDX`是啥，就搜索了一下，找到了[SPDX License List](https://spdx.org/licenses/)。

最后根据项目性质，设置了[`CC-BY-SA-4.0`](https://spdx.org/licenses/CC-BY-SA-4.0.html)（知识共享署名相同方式共享 4.0 国际版）的许可证。



## 写在最后



本次体验令我对前端工具的复杂度的认知再次上了一个台阶。

不过解决问题的过程及结果还是令人兴奋不已的，会感觉自己仍然年轻、仍然可以继续学习。

