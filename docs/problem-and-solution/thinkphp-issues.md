# ThinkPHP Issues

> 关于 ThinkPHP 框架的一些疑问。



## 消息队列



官方扩展：[`thinkphp/think-queue`](https://github.com/top-think/think-queue)



执行命令如下：



```bash
$ php think queue:listen

$ php think queue:work --daemon（不加--daemon为执行单个任务）
```



### 两种执行方式的区别



官方回答参见[#9](https://github.com/top-think/think-queue/issues/9#issuecomment-342800230)。总结如下：

- listen 模式负责管理 work 进程， work 进程则负责处理单个任务后退出；
- work 进程退出后， listen 进程会再次创建一个新的 work 进程，来处理下一个任务；
- work 进程超时后，listen 进程会及时结束 work 进程；
- 即 listen 进程是常驻的，每个 work 被创建时都会自动重新加载框架、加载最新代码；
- 而 work + daemon 模式下需要重启 work 进程方可加载最新代码。



在使用`topthink/think-queue:3.0`版本（ThinkPHP 版本为 6.0）过程中，更推荐使用`php think queue:listen`模式。



#### 超时问题？



使用过程中，遇到一个 job 由于执行时间过长，`php think queue:listen`命令抛出异常：

`Symfony\Component\Process\Exception\ProcessTimedOutException：`

`The process "'/usr/local/bin/php' 'think' 'queue:work' 'redis' '--once' '--queue=default' '--delay=0' '--memory=128' '--sleep=3' '--tries=0'" exceeded the timeout of 60 seconds.`。



一开始以为是 listen 命令需要设置监听时间，而监听时间默认为 60s，但没有找到相关配置；

后**仔细查看**异常信息，发现是 **work 命令执行超时**。



work 的默认执行超时时间是 60s（源代码位置：`\think\queue\Worker::daemon`）。

从 issues 中我知道了可以**通过给 listen 命令添加`--timeout`选项**（help 手册无该选项）来避免超时问题。

但这样会导致如果后面有新的、**执行时间更长的 job 加入时，listen 命令需要重启**（因为参数需要变化）。

