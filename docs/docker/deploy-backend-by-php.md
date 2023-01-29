# PHP 镜像部署项目 - 以 Hyperf 项目为例



[[TOC]]



## 基础信息



- 项目目录：`/opt/www`
- 可访问目录：`/opt/www`
- 访问路径：`http://test.backend.com`（仅做示例参考：环境名.代码仓库名.com）
- Nginx 容器映射：`/data/www:/opt/www`（本地：容器，假设已存在）
- PHP 容器映射：`"$PWD:/opt/www"`（本地当前目录：容器）



::: warning
运用至实际项目中，请注意根据实际情况更改以上信息。
:::



## 服务配置



在启动服务前，需要确认各服务的相关配置。例如 Nginx 是必须使用的。



### Nginx



假设 Nginx 配置文件在项目目录`/deploy/nginx`下，编辑/新建该项目的 nginx 配置文件`default.conf`：



```nginx
# see: http://nginx.org/en/docs/varindex.html
# 这里配置了一下 nginx 日志输出的格式，主要用于了解 nginx 配置文件各参数的意义
# 也更加清晰地查看访问信息
log_format custom   '\n\t"Request Time: $time_iso8601" \n\t'
                    '"Request ID: $request_id" \n\t'
                    '"Request: $request $status $body_bytes_sent bytes - $request_time s" \n\t'
                    '"Server IP: $server_addr:$server_port" \n\t'
                    '"Client IP: $remote_addr:$remote_port" \n\t'
                    '"Server Name: $server_name | $host" \n\t'
                    '"Request Uri: $request_uri" \n\t'
                    '"Request Path: $scheme://$server_name:$server_port$request_uri" \n\t'
                    '"Request Args: $args" \n\t'
                    '"Content Type: $content_type" \n\t';

access_log /var/log/nginx/access.log custom;

# 配置上传文件的大小
client_max_body_size  128M;

server {
    listen       80;
    server_name  localhost,test.backend.com;
    root         /opt/www;
    charset      utf-8;

    location /
    {
        add_header Access-Control-Allow-Origin  '*';
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS, PUT, DELETE';
        add_header Access-Control-Allow-Headers 'x-token,DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Authorization';

        if ($request_method = 'OPTIONS')
        {
            return 204;
        }

        proxy_set_header    Host                $http_host;
        proxy_set_header    X-Real-IP           $remote_addr;
        proxy_set_header    X-Real-PORT         $remote_port;
        proxy_set_header    X-Forwarded-For     $proxy_add_x_forwarded_for;

        # 如果该项目后端为 PHP + Swoole 的配置，则需要将代理指向 PHP 容器的 9501 端口
        # 请注意，PHP 容器必须暴露对应端口
        proxy_pass http://php:9501;
    }
}

# 以下为 PHP-FPM 项目的常见配置
server {
    listen       81;
    server_name  localhost,test.backend-fpm.com;
    root         /opt/www;
    charset      utf-8;

    location /
    {
        add_header Access-Control-Allow-Origin  '*';
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS, PUT, DELETE';
        add_header Access-Control-Allow-Headers 'x-token,DNT,X-Mx-ReqToken,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Authorization';

        if ($request_method = 'OPTIONS')
        {
            return 204;
        }

        proxy_set_header    Host                $http_host;
        proxy_set_header    X-Real-IP           $remote_addr;
        proxy_set_header    X-Real-PORT         $remote_port;
        proxy_set_header    X-Forwarded-For     $proxy_add_x_forwarded_for;

        location / {
            # !-e 判断的是目录或文件是否不存在，不存在时则重写
            # !-f 判断的是文件是否不存在，不存在时则重写
            if (!-f $request_filename) {
                # 路由重写 - 一律重写至 index.php 下，由项目代码进行路由定义
                rewrite ^/(.*)$             /index.php?s=$1 last; break;
            }
        }

        location ~ \.php$ {
            include                  fastcgi_params;
            include                  fastcgi.conf;
            
            # 使用代理指向 PHP 容器的 9000 端口
            fastcgi_pass             php:9000;
            
            fastcgi_intercept_errors on;
            fastcgi_param SCRIPT_FILENAME $document_root/$fastcgi_script_name;
        }
    }
}
```



### PHP



PHP 的配置多与上传文件配置、扩展开启情况等有关，这里不对其进行重载或映射说明。

一般需要设置的项目如下：



```ini
upload_max_filesize=128M
post_max_size=128M
memory_limit=1G
date.timezone=Asia/Shanghai
```



将以上信息写入文件`/deploy/php/override.ini`下即可。



### 其他



另外诸如 MySQL、Redis 等服务的配置，可使用其默认配置，需要时查阅其官方仓库来对其配置文件进行映射。这里不再说明。



## 项目启动



对于 PHP-FPM 项目而言，仅需将其代码完整存放在合适的位置即可。也就是说，执行以下命令：

```shell
$ cd /opt/www

$ composer install -o -vv

# 可能需要修改 .env 文件
# 请进入项目目录使用 vim 进行修改

# 根据项目数据库文件迁移库的不同，数据库迁移命令也有所不同
# 请根据实际使用修改以下命令，这里以 ThinkPHP 为例：
$ php think migrate:run
```



### Hyperf 项目



Hyperf 是一个渐进式 PHP 协程框架，它是常驻内存的，需要启动，具体可参考其[官方说明](https://hyperf.wiki/2.2/#/README)。这里不再赘述。

它的启动要稍显复杂一些：



```shell
$ cd /opt/www

$ composer install -o -vv

# 可能需要修改 .env 文件
# 请进入项目目录使用 vim 进行修改

# 根据项目数据库文件迁移库的不同，数据库迁移命令也有所不同
# 请根据实际使用修改以下命令，这里以 Hyperf 为例：
$ php ./bin/hyperf.php migrate

# 启动项目（代码文件有所变动时需要重新启动方可执行最新修改）
$ php ./bin/hyperf.php start
```



### Entrypoint 脚本



可以看出，启动 PHP 项目所需要的命令较多，如果在 Docker compose 中使用`command`或`entrypoint`指令的话，会显得很复杂且不可控。

因此可以将项目启动命令整合为一个 Shell 脚本，将 Shell 脚本作为 Docker compose 的入口命令。

以 Hyperf 项目启动命令为例（`/opt/www/entrypoint.sh`）：



```shell
#!/bin/sh

# Install dependences
composer install -o -vv

# Execute database migrations
php ./bin/hyperf.php migrate

# Setup program
php ./bin/hyperf.php start

printf "\033[42;37m Setup Completed :).\033[0m\n"
```

在 Docker compose 配置文件的 PHP 容器中仅需使用`entrypoint: ["sh", "/opt/www/entrypoint.sh"]`配置项即可，避免使用过多、过复杂的命令，使其更加可控。



## Docker Compose



在确定项目所需要的服务后，我们可以使用 Docker Compose 对其进行编排。笔者自己常用的几个服务如下：



::: warning

请注意宿主机上可用的端口号，避免端口冲突。

:::



::: tip

请根据自己需要更改配置参数。更多参数请参考镜像仓库的相关说明。

:::



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
      - 8881:80
    working_dir: /opt/www
    volumes:
      - ./docs/deploy/conf.d:/etc/nginx/conf.d/:rw
      - .:/opt/www
    networks:
      - default

  php:
    image: linnzh/php:8.0-alpine-swoole
    working_dir: /opt/www
    depends_on:
      - redis
    volumes:
      - .:/opt/www
    entrypoint: ["sh", "/opt/www/entrypoint.sh"]
    expose:
      - 9501
    networks:
      - default

  redis:
    image: redis:5.0.3-alpine
    ports:
      - "63790:6379"
    networks:
      - default

  mysql:
    image: mysql:8.0.31
    ports:
      - "33061:3306"
    command: --default-authentication-plugin=mysql_native_password --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
    environment:
      MYSQL_ROOT_PASSWORD: "Linnzh@1996"
      MYSQL_USER: "linnzh"
      MYSQL_PASSWORD: "Linnzh@1996"
      MYSQL_DATABASE: "test"
    volumes:
      - ./runtime/deploy/mysql:/var/lib/mysql
    networks:
      - default
```



### 启动



初次启动时可直接启动所有服务：`docker-compose up -d`。

如需重启某项服务：`docker-compose restart php`。



::: tip 优点

使用 Docker Compose 后，各项服务单独治理。

项目重启从进入一个个服务分别执行各项命令，变成了一键重启 Docker 容器。

减少了许多手动操作的步骤，避免人为因素造成的错误。

:::



## Reference



部分参考如下：

### Docker Compose 命令



更多 docker compose 命令参考：<https://docs.docker.com/compose/reference/>



```shell
$ docker-compose up                         # 创建并且启动所有容器
$ docker-compose up -d                      # 创建并且后台运行方式启动所有容器
$ docker-compose up nginx mysql              # 创建并且启动 nginx、mysql 的多个容器
$ docker-compose up -d nginx mysql           # 创建并且已后台运行的方式启动 nginx、mysql 容器

$ docker-compose start mysql                  # 启动服务
$ docker-compose stop mysql                   # 停止服务
$ docker-compose restart mysql                # 重启服务
$ docker-compose build mysql                  # 构建或者重新构建服务

$ docker-compose rm mysql                     # 删除并且停止 mysql 容器
$ docker-compose mysql                        # 停止并删除容器，网络，图像和挂载卷
```



### Shell 脚本



- [Advanced Bash-Scripting Guide](https://tldp.org/LDP/abs/html/index.html)



