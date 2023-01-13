# Node 镜像部署项目

最简单部署方式请参考[项目构建](#项目构建) 。

[[TOC]]

## 基础信息



- 项目目录：`/data/www/react-frontend`
- 可访问目录：`/data/www/react-frontend/dist`
- 访问路径：`http://test.react-frontend.com`（仅做示例参考：环境名.代码仓库名.com）
- Nginx 容器映射：`/data/www:/data/www`（本地：容器，假设已存在）
- Node 容器映射：`"$PWD:/data/www"`（本地当前目录：容器）


::: warning
运用至实际项目中，请注意根据实际情况更改以上信息。
:::

## Nginx 服务配置



对于静态站点来说，该服务仅需配置一次。



假设 Nginx 配置文件在目录`/etc/nginx/conf.d`下，编辑/新建该项目的 nginx 配置文件`react-frontend.conf`：



```nginx
server {
    listen  80;
    
    # 配置访问地址
    # 这里配置了多个访问地址，多个访问地址请使用英文逗号隔开，请注意不要存在空格
    # server_name 有最大字符长度限制，如 nginx 运行报错，请酌情留下需要的数据
    server_name test.react-frontend.com,pre.react-frontend.com,prod.react-frontend.com;

    # 配置错误日志地址
    error_log    /var/log/nginx/react-frontend.error.log;
    access_log   /var/log/nginx/react-frontend.access.log;

    # 可访问目录
    root    /data/www/dist;
    location / {
        index     index.html;
        try_files $uri $uri/ /index.html;
    }

    # 一些其他配置
    gzip on;
    gzip_min_length 1k;
    gzip_buffers 4 16k;
    #gzip_http_version 1.0;
    gzip_comp_level 2;
    gzip_types text/plain application/x-javascript application/javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png;
    #gzip_vary off;
    gzip_disable "MSIE [1-6]\.";
}
```


然后重启 Nginx 服务：



```bash
# 假设在 docker 中运行
$ docker exec -it nginx sh

# Nginx 容器内
$ nginx -t
$ nginx -s reload
```



## 项目构建



```bash
# 进入项目根目录
$ cd /data/www/react-frontend
# 拉取最新代码
$ git pull

# 使用 Node 镜像打包 
$ docker run -it --rm -v "$PWD:/www" -w "/www" node:16.18.1 sh

# 此时在 Node 容器内，请根据项目配置进行打包
# 假设当前环境为预发环境，打包命令为 yarn run build:pre

# 配置 Yarn 淘宝镜像
$ yarn config set registry https://registry.npmmirror.com/
# 配置忽略 SSL 严格模式，避免出现 self signed certificate in certificate chain 问题
$ yarn yarn config set strict-ssl false

# 安装项目依赖
$ yarn install

# 构建
$ yarn run build:pre

# 以上过程无误后可退出 Node 容器
# 浏览器访问 http://test.react-frontend.com 查看是否为最新版本
```

## 使用 Docker

这里指使用一个 Dockerfile 来包揽所有部署，包括项目构建、打包和部署。最后只需要一个`docker run`命令自动完成所有操作。

::: warning 不推荐

当前 Dockerfile 将复制整个项目，如果项目依赖过多，构建时间将大大加长。

而如果通过`.dockerignore`文件来排除`node_modules`目录的复制，构建时`yarn install`安装依赖的过程又会很长。

:::

[项目构建](#项目构建)中的代码可汇总为以下 Dockerfile：

```docker
FROM node:16.18.1

ARG ENV_RUNTIME=dev

WORKDIR /data/www
COPY . /data/www

RUN set -ex \
    && npm -v \
    && yarn -v \
    && yarn config set registry "https://registry.npmmirror.com/" \
    && yarn config set strict-ssl false \
    && yarn install \
    && npm run build:${ENV_RUNTIME}
    
# TODO 还差 Nginx
```

此时可以构建镜像：`docker build -t react-frontend .`，
打包时在项目根目录运行命令：`docker run -itd -v "$PWD:/data/www" react-frontend`即可。


## 使用 Docker Compose

使用 Docker Compose 进行部署的优势之一就是**可以使用目录映射来避免重复安装依赖或者大目录复制问题**。

::: tip 不考虑使用 build
原想法是使用`build`指令来运用 Dockerfile，但使用 command 和 entrypoint 指令要更适合前端项目。
即便这两个命令不适用于执行过于复杂的命令（或者超过 2 个的命令），也可以使用 shell 脚本来实现。
:::


参考`docker-compose.yml`如下：

```yaml
version: "3.7"

# Please refer to the official documentation:
# https://docs.docker.com/compose/compose-file/

networks:
  default:
    driver: bridge

services:
  nginx:
    image: nginx:1.22-alpine
    ports:
      - 80:80
    working_dir: /data/www

    # Nginx server 配置文件目录
    # 假定在项目根目录下的 docs/deploy/conf.d
    volumes:
      - ./docs/deploy/conf.d:/etc/nginx/conf.d/:rw
      - .:/data/www
    networks:
      - default
  node:
    image: node:16.18.1
    working_dir: /data/www
    volumes:
    - .:/data/www
    
    # command 和 entrypoint 均只允许执行一条命令
    # 二者结合可使用两条命令，更多命令可通过 shell 脚本实现
    command: yarn install
    entrypoint: ["npm", "run", "build:pre"]
    networks:
      - default
```

以上配置文件在执行`docker-compose up -d`成功后，node 容器会自动退出（因为没有常驻进程），但想要的目的（**构建静态代码至`dist`目录）已经达成，node 容器是否存活不重要。

::: tip Nginx
其中，文件`docs/deploy/conf.d/default.conf`可参考[Nginx 服务配置](#Nginx-服务配置)
:::

### 代码更新时

一旦项目代码进行更新，就需要重新打包`dist`目录。此时只需进入项目根目录，然后执行**重启node容器**的命令即可：

```shell
# 重启 node 服务
$ docker-compose restart node
```

### 多环境支持

有多种方案。

::: tip
**推荐使用方案 2**，不需要为多个环境配置多个分支。
:::

#### 方案 1

不同环境使用不同分支，例如`master`指向生产环境、`staging`指向预发环境、`dev`指向开发环境等。

不同分支仅`docker-compose.yml`文件不同（仅打包命令不同）。

如上`entrypoint: ["npm", "run", "build:pre"]`打包预发环境，那么`master`分支该项可变为：`entrypoint: ["npm", "run", "build:prod"]`

具体修改可参考`package.json`文件配置。

#### 方案 2

使用`docker-compose.yml.example`模板文件，在不同环境执行如下命令：
  
```shell
$ cp ./docker-compose.yml.example docker-compose.yml
# 进入 docker compose 文件并修改执行命令（如上）
$ vi docker-compose.yml
```

#### 方案 3

另有一个无需更改配置文件的方案：**使用 node 镜像手动打包**。

容器运行后，node 容器虽然 die 了，但镜像无需拉取，我们只需借助 node 镜像来完成自己需要的命令。

以上述方案为例，我们使用`node:16.18.1`镜像启动一个临时容器：

::: warning
这里使用的是原镜像，而不是 docker compose 中的 node 容器！
:::

```shell
# 进入 node 容器（使用 --rm 选项，容器退出后即删除该容器）
$ docker run -it --rm -v "$PWD:/data/www" -w "/data/www" node:16.18.1 sh

# 此时成功进入到 node 容器，当前目录为项目根目录

# 执行 build 命令（假设当前环境为开发环境，但是打包生产环境的代码）
$ npm run build:prod

# 构建命令执行完成后，按下 Ctrl + D 后退出该容器
```

刷新页面，检查是否转为生产环境的代码。

## Reference

### Docker Compose 命令

更多 docker compose 命令参考：<https://docs.docker.com/compose/reference/>

```shell
$ docker-compose up                         # 创建并且启动所有容器
$ docker-compose up -d                      # 创建并且后台运行方式启动所有容器
$ docker-compose up nginx node              # 创建并且启动 nginx、node 的多个容器
$ docker-compose up -d nginx node           # 创建并且已后台运行的方式启动 nginx、node 容器

$ docker-compose start node                  # 启动服务
$ docker-compose stop node                   # 停止服务
$ docker-compose restart node                # 重启服务
$ docker-compose build node                  # 构建或者重新构建服务

$ docker-compose rm node                     # 删除并且停止 node 容器
$ docker-compose node                        # 停止并删除容器，网络，图像和挂载卷
```
