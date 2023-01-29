# Get started - Shell script



关于 Shell 脚本的一些学习笔记。其全部参考于[Advanced Bash-Scripting Guide](https://tldp.org/LDP/abs/html/index.html)。



::: tip

部分参数解析参考工具网站：[explainshell](https://explainshell.com/)

:::



[[TOC]]



## Runtime



### Docker compose



本次运行环境使用 Alpine 的 Docker 容器。其 Docker Compose 文件如下：



```yaml
version: "3.7"

# Please refer to the official documentation:
# https://docs.docker.com/compose/compose-file/

networks:
  default:
    driver: bridge

services:
  linux:
    image: alpine:3.17
    working_dir: /opt/www
    volumes:
      - .:/opt/www
    networks:
      - default
    
    # /dev/null 代表 linux 的空设备文件，所有往这个文件里面写入的内容都会丢失，俗称“黑洞”。
    # 那么执行了 >/dev/null 之后，标准输出就会不再存在，没有任何地方能够找到输出的内容。
    # 该 entrypoint 命令是为了让容器始终保持在线状态
    entrypoint: ["tail", "-f", "/dev/null"]
```



### 注意事项



- 在 Docker 容器中，直接启动该容器时，其用户变量未设置（ex：`$UID`及`$USER`的值均为空）
- `/dev/null`代表 linux 的空设备文件，所有往这个文件里面写入的内容都会丢失



## Basic



> 关于 shell 脚本中常见的一些用法说明。



### 授权脚本



```bash
# 授予所有用户对该脚本的「读取/执行」权限
$ chmod 555 scriptname
# 等同于
$ chmod +rx scriptname

# 仅授予该脚本的拥有者（owner）以对该脚本的「读取/执行」权限
$ chmod u+rx scriptname
```





### 变量



::: warning CAUTION

变量名不能使用 Shell 里的关键字（可通过`help`命令查看保留关键字）

:::



::: tip

可通过`env`命令查看**用户环境变量**；通过`set`命令查看**Shell预定义变量+用户变量**。

:::



```shell
#!/bin/sh

# 设置变量
LOG_DIR=/var/log

# 使用变量
echo $LOG_DIR
```



#### Shell 变量



| 变量 | 含义                                                         |
| ---- | ------------------------------------------------------------ |
| `$0` | 当前脚本的文件名                                             |
| `$n` | 传递给脚本或函数的参数。n 是一个数字，表示第几个参数。<br />例如，第一个参数是`$1`，第二个参数是`$2`。 |
| `$#` | 传递给脚本或函数的参数个数                                   |
| `$*` | 传递给脚本或函数的所有参数。                                 |
| `$?` | 上个命令的退出状态，或函数的返回值，成功会返回 0，失败返回非 0 |
| `$$` | 当前 Shell 进程 ID，对于 Shell 脚本，就是这些脚本所在的进程 ID |



### 输出

<br />

#### echo



::: tip

详细信息请使用`echo -h`查看使用帮助。

:::



```shell
#!/bin/sh

# 字符串拼接（使用空格隔开即可）
# shell 脚本中存在大量预定义变量，例如 $USER 为当前用户名
echo "当前用户名：" $USER "当前UID：" $UID "当前GID：" $GID

# 将信息写入某文件
# 文件不存在时创建
# 存在时覆盖
echo "Some information..." > /var/log/tmp.txt
```



#### tail



::: tip

详细信息请使用`tail -h`查看使用帮助。

:::



```shell
#!/bin/sh

# tail
# 输出文件 $filepath 的最后 $lines 行内容
lines=100
filepath=/var/log/tmp.log

tail -n $lines $filepath
```



#### 一些条件表达式和运算符



```shell
#!/bin/sh

T_NUMBER=1

# -eq 等于
OPERATOR="-eq 等于"
[ $T_NUMBER -eq 1 ] && echo "$OPERATOR: INTEGER1 is equal to INTEGER2" \
  || echo "INTEGER1 is not equal to INTEGER2"

# -ne 不等于
OPERATOR="-ne 等于"
[ $T_NUMBER -ne 0 ] && echo "$OPERATOR: INTEGER1 is not equal to INTEGER2" \
  || echo "INTEGER1 is equal to INTEGER2"

# -gt 大于
OPERATOR="-gt 大于"
[ $T_NUMBER -gt 0 ] && echo "$OPERATOR: INTEGER1 is greater than INTEGER2" \
  || echo "INTEGER1 is less than or equal to INTEGER2"

# -lt 小于
OPERATOR="-lt 小于"
[ $T_NUMBER -lt 2 ] && echo "$OPERATOR: INTEGER1 is less than INTEGER2" \
  || echo "INTEGER1 is greater than or equal to INTEGER2"

# -ge 大于等于
OPERATOR="-ge 大于等于"
[ $T_NUMBER -ge 1 ] && echo "$OPERATOR: INTEGER1 is greater than or equal to INTEGER2" \
  || echo "INTEGER1 is less than INTEGER2"

# -le 小于等于
OPERATOR="-le 小于等于"
[ $T_NUMBER -le 1 ] && echo "$OPERATOR: INTEGER1 is less than or equal to INTEGER2" \
  || echo "INTEGER1 is greater than INTEGER2"
```





### 分支结构 - if



`if`判断条件使用`[]`包裹，而不是常见编程语言中的圆括号。并且必须以`fi`结尾。



```shell
#!/bin/sh

# 如果命令行参数不为空
# -n the length of STRING is nonzero
if [ -n "$1" ]; then
  echo "the length of STRING is nonzero: $1"
else
  echo "the length of STRING is zero"
fi

# 如果命令行参数为空
# -z the length of STRING is zero
if [ -z "$1" ]; then
  echo "the length of STRING is zero"
elif [ -n "$1" ]; then
  echo "the length of STRING is nonzero: $1"
else
  echo "It is not possible to reach the condition branch"
fi

# Can only exit with status 0-255. Other data should be written to stdout/stderr.
exit 0
```



