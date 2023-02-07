# Usage of WebSocket



[[TOC]]



## Abstract



什么是 WebSocket？

引用[维基百科](https://zh.wikipedia.org/zh-hans/WebSocket)上的一段话：

> **WebSocket** 是一种[网络传输协议](https://zh.wikipedia.org/wiki/网络传输协议)，可在单个[TCP](https://zh.wikipedia.org/wiki/传输控制协议)连接上进行[全双工](https://zh.wikipedia.org/wiki/全雙工)通信，位于[OSI模型](https://zh.wikipedia.org/wiki/OSI模型)的[应用层](https://zh.wikipedia.org/wiki/应用层)。
>
> WebSocket 使得客户端和服务器之间的数据交换变得更加简单，允许服务端主动向客户端推送数据。在WebSocket API中，浏览器和服务器只需要完成一次握手，两者之间就可以建立持久性的连接，并进行双向数据传输。

其关键字：**双向数据传输**。也就是说，它不需要由客户端发起，服务端可以主动推送。

更多信息在[维基百科](https://zh.wikipedia.org/zh-hans/WebSocket)已经说明了，这里不再赘述。



## Cause



做项目的过程中，由于客户端不保留持久化信息，很多时候需要服务端去==通知==客户端“干什么”，也就是“推送”。

早期，很多网站为了实现[推送技术](https://zh.wikipedia.org/wiki/推送技术)，所用的技术都是[轮询](https://zh.wikipedia.org/wiki/輪詢)。



### 轮询



**轮询**是指由浏览器每隔一段时间（如每秒）向服务器发出HTTP请求，然后服务器返回最新的数据给客户端。

这种传统的模式带来很明显的缺点，即浏览器需要不断的向服务器发出请求，然而HTTP请求与回复可能会包含较长的[头部](https://zh.wikipedia.org/wiki/HTTP头字段)，其中真正有效的数据可能只是很小的一部分，所以这样会消耗很多带宽资源。



### WebSocket 协议



在这种情况下，[HTML5](https://zh.wikipedia.org/wiki/HTML5)定义了WebSocket协议，能更好的节省服务器资源和带宽，并且能够更实时地进行通讯。

Websocket使用`ws`或`wss`的[统一资源标志符](https://zh.wikipedia.org/wiki/统一资源标志符)（URI）。其中`wss`表示使用了[TLS](https://zh.wikipedia.org/wiki/TLS)的Websocket。如：

```
ws://example.com/wsapi
wss://secure.example.com/wsapi
```

Websocket 与 HTTP 和 HTTPS 使用相同的 TCP[端口](https://zh.wikipedia.org/wiki/TCP/UDP端口列表)，可以绕过大多数[防火墙](https://zh.wikipedia.org/wiki/防火墙)的限制。默认情况下，Websocket 协议使用 80 端口；运行在 TLS 之上时，默认使用 443 端口。



### 场景



从其说明可以看出，websocket 技术适用于**即时聊天**、**通知**等常见场景。

GitHub 上也有很多相关的即时聊天案例，但目前没有相关需求，这里不做了解。

更多的是通知推送的场景。这里以==通知推送==为例阐述其使用。



## Usage



笔者目前熟悉的服务端是 PHP，因此这里仅使用 PHP 进行说明。可能会使用多个 PHP 框架进行说明，为简化说明，这里不做前后端分离。



### 约定



- 本示例项目均使用 Docker 运行
- 前端地址：<http://localhost:5500>
- 服务端地址
  - HTTP：<http://localhost:9091>
  - WebSocket：<ws://localhost:2345>



### 前端使用



这里使用最简单的 HTML 调用 websocket：



```html
<!DOCTYPE html>
<html lang="zh">
    <head>
        <meta charset="utf-8" />
        <title>WebSocket</title>
    </head>
    <body>
        <script>
            ws = new WebSocket("ws://localhost:2345");

            let counter = 0;
            ws.onopen = function() {
                console.info("WebSocket通道建立成功！！！");
                ws.send("hello");
                console.debug("给服务端发送一个字符串：hello");
            };
            ws.onerror = function(even) {
                console.error("服务端错误：", even);
                counter++;
            };
            ws.onmessage = function(even) {
                console.info("收到服务端的消息：" + even.data);
                counter++;
            };
            if (counter > 10) {
                ws.onclose = function(even) {
                    console.warn(`已收到 ${counter} 条消息，自动关闭 websocket 连接`);
                }
            }
        </script>
    </body>
</html>
```





### ThinkPHP + Workerman



创建一个 ThinkPHP 项目请参考其[官方说明](https://github.com/top-think/framework)，这里以笔者本人项目[tp-multi-app](https://github.com/SimpleLearnCoding/tp-multi-app)为例，从[Commit](https://github.com/SimpleLearnCoding/tp-multi-app/commit/0eedb25a1ad6120f9b15ccf89ff008311e2fea1b)开始，之前的可以忽略。

启动该项目可直接使用 Docker Compose 命令：`docker compose up -d`。



由于该示例项目不做前后端分离，因此我们需要引入包[`topthink/think-view`](https://packagist.org/packages/topthink/think-view)：



```bash
# 引入前端视图包：topthink/think-view
$ composer require topthink/think-view
```



在目录`app/admin/view/websocket`下新建文件`index.html`，内容如[前端使用](#前端使用)代码所示。



::: warning

这里的视图目录在`app/admin/view`下，是因为该项目为**多应用模式**。

如果为单应用模式，则应在项目根目录`view`下。

:::



并在 admin 应用的某个 Controller 下定义一个访问该视图文件的路由：



```php
<?php
declare (strict_types = 1);

namespace app\admin\controller;

use app\BaseController;

class IndexController extends BaseController
{
    public function websocket()
    {
        return view('websocket/index');
    }
}
```



此时，访问地址 <http://localhost:9091/index/websocket> 即可看到视图文件中定义的内容。此刻我们的 websocket 服务端代码还没有，因此控制台会抛出异常：

```http
服务端错误： 
error { target: WebSocket, isTrusted: true, srcElement: WebSocket, eventPhase: 0, bubbles: false, cancelable: false, returnValue: true, defaultPrevented: false, composed: false, timeStamp: 627, … }
websocket:21:17
    onerror http://localhost:9091/index/websocket:21
```



#### 引入 think-worker



PHP 框架中常用 [Workerman](https://github.com/walkor/workerman) 来作为 websocket 服务支持。在 ThinkPHP 官方包[`topthink/think-worker`](https://github.com/top-think/think-worker)中已对其进行集成（但截至 2023/02/07 最高仅支持 workerman 3.5 版本）。



```bash
$ composer require topthink/think-worker
```



此时会在`config`目录下生成三个文件：

- [`config/worker.php`](https://github.com/top-think/think-worker/blob/3.0/src/config/server.php)
- [`config/worker_server.php`](https://github.com/top-think/think-worker/blob/3.0/src/config/server.php)
- [`config/gateway_worker.php`](https://github.com/top-think/think-worker/blob/3.0/src/config/gateway.php)

这里仅需关注文件`config/worker_server.php`，它对指令`php think worker:server`有效，也是后端服务启动 websocket 的指令。



这里了解一下 websocket 通信阶段：

1. `onConnect`：连接成功
2. `onMessage`：接收到信息
3. `onClose`：连接关闭
4. `onError`：连接错误



在[原始配置文件](https://github.com/top-think/think-worker/blob/3.0/src/config/server.php)中定义了以上事件的回调，但是为了更好地控制回调事件（而不是统一回调），这里对配置文件进行修改如下：



```diff
 return [
-    'protocol'       => 'websocket', // 协议 支持 tcp udp unix http websocket text
-    'host'           => '0.0.0.0', // 监听地址
-    'port'           => 2345, // 监听端口
-    'socket'         => '', // 完整监听地址
-    'context'        => [], // socket 上下文选项
-    'worker_class'   => '', // 自定义Workerman服务类名 支持数组定义多个服务
+    /**
+     * 以下信息可在 worker_class 服务类的类属性中配置
+     */
+    // 'protocol'       => 'websocket', // 协议 支持 tcp udp unix http websocket text
+    // 'host'           => '0.0.0.0', // 监听地址
+    // 'port'           => 2345, // 监听端口
+    // 'socket'         => '', // 完整监听地址
+    // 'context'        => [], // socket 上下文选项

-    // 支持workerman的所有配置参数
-    'name'           => 'thinkphp',
+    'worker_class'   => [
+        \app\admin\controller\WebsocketController::class
+    ], // 自定义Workerman服务类名 支持数组定义多个服务
+
+    /**
+     * 以下信息支持 workerman 的所有配置参数
+     * 可以在 worker_class 服务类的 $option 中配置
+     */
+    'name'           => 'worker',
     'count'          => 4,
     'daemonize'      => false,
     'pidFile'        => '',
-
-    // 支持事件回调
-    // onWorkerStart
-    'onWorkerStart'  => function ($worker) {
-
-    },
-    // onWorkerReload
-    'onWorkerReload' => function ($worker) {
-
-    },
-    // onConnect
-    'onConnect'      => function ($connection) {
-
-    },
-    // onMessage
-    'onMessage'      => function ($connection, $data) {
-        $connection->send('receive success');
-    },
-    // onClose
-    'onClose'        => function ($connection) {
-
-    },
-    // onError
-    'onError'        => function ($connection, $code, $msg) {
-        echo "error [ $code ] $msg\n";
-    },
 ];
```



主要变动为：

- `worker_class`选项支持数组，配置多个 websocket 服务类，便于不同的服务类定制化
- 将回调事件（onWorkerStart、onWorkerReload、onConnect、onMessage、onClose、onError）移入对应的 worker_class（这里是`\app\admin\controller\WebsocketController::class`）



一个标准的 websocket 服务类应实现以上回调事件，这里可定义一个 `WebsocketServiceInterface` 接口：



```php
<?php


namespace workerman;


use Workerman\Connection\ConnectionInterface;

interface WebSocketServiceInterface
{
    public function onWorkerStart(Worker $worker);
    public function onWorkerReload(Worker $worker);
    public function onConnect(ConnectionInterface $connection);
    public function onMessage(ConnectionInterface $connection, $data);
    public function onClose(ConnectionInterface $connection);
    public function onError(ConnectionInterface $connection, $code, $msg);
}
```



进而可以抽象化该接口的实现`WebSocketService`：



```php
<?php


namespace worker;


use workerman\Connection\ConnectionInterface;
use workerman\WebSocketServiceInterface;
use Workerman\Worker;


abstract class WebSocketService extends \think\worker\Server implements WebSocketServiceInterface
{
    /**
     * @var string 服务协议
     * @support tcp udp unix http websocket text
     */
    protected $protocol = 'websocket';
    /**
     * @var int 监听端口
     */
    protected $port = 2345;

    /**
     * @var string[] 支持 workerman 的所有配置参数
     */
    protected $option = [
        'name' => 'Websocket',
    ];

    public function onWorkerStart(Worker $worker)
    {
        echo sprintf('%s worker status is %s' . PHP_EOL, date('Y-m-d H:i:s'), 'onWorkerStart');
    }

    public function onWorkerReload(Worker $worker)
    {
        echo sprintf('%s worker status is %s' . PHP_EOL, date('Y-m-d H:i:s'), 'onWorkerReload');
    }

    public function onConnect(ConnectionInterface $connection)
    {
        echo sprintf('%s worker status is %s' . PHP_EOL, date('Y-m-d H:i:s'), 'onConnect');
        $connection->send('成功连接！' . date('Y-m-d H:i:s'));
    }

    public function onMessage(ConnectionInterface $connection, $data)
    {
        echo sprintf('%s worker status is %s' . PHP_EOL, date('Y-m-d H:i:s'), 'onMessage');
    }

    public function onClose(ConnectionInterface $connection)
    {
        echo sprintf('%s worker status is %s' . PHP_EOL, date('Y-m-d H:i:s'), 'onClose');
        $connection->send('连接已关闭');
    }

    public function onError(ConnectionInterface $connection, $code, $msg)
    {
        echo sprintf('%s worker status is %s' . PHP_EOL, date('Y-m-d H:i:s'), 'onError');
        echo sprintf('Error [%d] $s' . PHP_EOL, $code, $msg);
        $connection->send('连接出错');
    }
}
```



抽象类`WebSocketService`将基本配置项包含进去了，具体服务类可基于该抽象类进行定制化。

这里继承该抽象类：

```php
<?php


namespace app\admin\controller;


use worker\WebSocketService;
use Workerman\Connection\ConnectionInterface;


class WebsocketController extends WebSocketService
{
    protected $option = [
        'name' => 'Demo',
    ];

    public function onMessage(ConnectionInterface $connection, $data)
    {
        $couter = 0;
        while (true) {
            $connection->send($this->rawResponse(['message' => $data, 'time' => date('Y-m-d H:i:s')]));
            sleep(2);
            ++$couter;
            if ($couter > 20) {
                $connection->send($this->rawResponse(['message' => '超时，已离线', 'time' => date('Y-m-d H:i:s')]));
                $connection->close();
            }
        }
    }

    private function rawResponse(array $data = null)
    {
        return json_encode($data, JSON_UNESCAPED_UNICODE);
    }
}
```



然后运行命令`php think worker:server`启动 WebSocket 服务，访问地址 <http://localhost:9091/index/websocket> ，可在控制台看到 websocket 消息。



至此，Websocket 的基本使用已完成。以上过程详细代码修改可参考[#1 WebSocket](https://github.com/SimpleLearnCoding/tp-multi-app/pull/1)。



## Others



另外其他框架的使用不再详细说明，请参考对应的 Pull Request。



- [Hyperf](https://github.com/SimpleLearnCoding/hyperf-skeleton/pull/1)







