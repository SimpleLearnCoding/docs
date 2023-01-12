# Redis - 基础

## 基本

### 数据结构

- 动态字符串
- 整数集合
- 压缩列表
- 快速链表
- 字典
- Stream 流

### 数据类型

- 字符串
- 列表
- 字典
- 集合+有序集合
- 散列表/哈希表
- 数据流

## 常用命令

### 键

```bash
# 查看键类型：none string list set zset hash stream 
type [key]

# 查看键过期时间：单位秒
ttl [key]
# 查看键过期时间：单位毫秒
pttl [key]

# 设置键过期时间：单位秒
expire [key] 200
# 删除键的过期时间（使其变为永久有效
persist [key]

# 重命名键
rename [key] [new_key]

# 更新 key 的访问时间，避免被 LRU 策略淘汰
touch [key……]

# 判断键是否存在，返回 key 存在的数量
exist [key1 key2 ……]

# 查找符合模式的键，并一次性返回，数据量大时容易阻塞服务器
keys [pattern]
# 例如：keys *
# keys red?s
# keys red*s
# keys red[ix]s
# keys red\[s

# 遍历键，不用担心阻塞服务器，未指定 count 参数时默认返回 10 个
scan cursor [match_pattern] [count=10]

# 随机取键：在当前数据库中随即返回一个尚未过期的 key
randomkey

# 删除键：同步删除，可能阻塞服务器
del [key……]
# 删除键：异步删除，在另一个线程进行内存回收，不阻塞当前线程
unlink [key……]

# 序列化键，并返回序列化后的数据
dump [key]
# 反序列化：使用 dump 命令序列化后进行反序列化
restore [key] [ttl]
```

### 字符串

```bash
# 设置值
set [key] [value] [EX ttl]

# 批量设置值
mset [key value] [key value……]
# 批量获取值
mget [key……]

# 追加字符串
append [key value]

# 计数器：将 key 的存储值加一或者减一，不因并发而导致统计出错
incr [key]
decr [key]
# 以下两个会先检查 key 值是否为整数，不是则失败，存储值增加或减少 increment/decrement 量
incrby [key] [increment]
decrby [key] [decrement]
# 以下两个会先检查 key 值是否为浮点数，不是则失败，存储值增加或减少 increment/decrement 量
incrbyfloat [key] [increment] 

# 获取值
get [key]

# 获取旧值并设置新值
getset [key value]

# 截取字符串
getrange [key start end]

# 获取字符串长度
strlen [key]
```

### 散列表/哈希

```bash
# 设置值
hset [key] [field value]
hmset [key] [field1 value1] [field2 value2……]
hsetnx [key] [field value]

# 判断 key 的 field 是否存在
hexists [key] [field]

# 获取值
hget [key] [field]
hmget [key] [field1……]
hkeys [key] # 获取指定 key 的全部 field
hvals [key] # 获取指定 key 的全部 value
hgetall [key] # 获取指定 key 的 field-value 对
hlen [key] # 获取指定 key 的 field 总个数
hscan [key] [cursor_index] [count=10] # 从指定位置（必须）遍历指定 key 的 count 个 field

# 删除 field （批量）
hdel [key] [field……]

# 自增
hincrby [key] [field] [increment]
hincrbyfloat [key] [field] [increment]
```

### 列表

```bash
# 在列表头部插入元素，如果 key 不存在则创建，返回列表的总长度
lpush [key] [value……]
# 在列表尾部插入元素，如果 key 不存在则创建，返回列表的总长度
rpush [key] [value……]
# 从列表头部弹出元素，并返回弹出的元素
lpop [key]
# 从列表尾部弹出元素，并返回弹出的元素
rpop [key]

# 获取元素
lindex [key] [index]
lrange [key] [start end] # -1 表示最后一个元素，-2 表示倒数第二个元素，越界则返回 empty array

# 获取列表长度
llen [key]

# 设置指定索引位置的元素值
lset [key] [index value]

# 插入元素：将值 value 插入到列表 key，且位于值 pivot 之前或之后
linsert [key] before|after [pivot_value] [value]

# 删除元素：移除列表中与 value 相等的 count 个元素，并返回被移除的元素数目
# count 为 0 时表示删除所有与 value 相等的元素，count 为正数时从表头搜索，反之从表尾
lrem [key] [count] [value]

# 裁剪列表：保留区间内的元素，区间外的元素将被删除
ltrim [key] [start end]
```

### 集合

```bash
# 集合特点：无序、成员唯一，基于 dict 和 intset

# 添加成员：返回加入成功的个数
sadd [key] [member……]

# 删除成员：返回删除成功的个数
srem [key] [member……]

# 获取成员：随机
srandmember [key]
# 删除随机成员并返回该成员
spop [key] [count=1]
# 获取集合中的所有成员
smembers [key]

# 查找成员是否存在于集合
sismember [key] [member]

# 移动成员：将 member 元素从 source 集合移动至 destination 集合
smove [source_key] [destination_key] [member]

# 获取基数（集合中的元素个数）
scard [key]

# 增量遍历集合元素：每次执行时返回少量元素和一个新的游标
# 该游标用于下次遍历时延续之前的遍历过程
# 游标为 0 时表示开始一轮新的迭代
sscan [cursor] [match_pattern] [count]

# 运算：交集
sinter [key……]
sinterstore [destination_key] [key……] # 求交集并将结果保存至 destination_key

# 运算：并集
sunion [key……]
# 运算：差集
sdiff [key……]
```

### 有序集合

```bash
# 添加
zadd [key] [score1 member1] [score2 member2]……

# 删除
zrem [key] [member……]

# 获取基数（集合元素个数）
zcard [key]

# 获取 score 值在指定区间内元素的个数
zcount [key] [min max]

# 成员值自增
zincrby [key] [increment] [member]

# 获取成员 member 在 按 score 从小到大排序 中的排名
zrank [key] [member]
# 获取成员 member 在 按 score 从大到小排序 中的排名
zrevrank [key] [member]

# 迭代遍历
zscan [key] [cursor] [match_pattern] [count]

# 获取指定区间内的成员，按 score 值递增排序，score 相同时按字典序排序
zrange [key] [start end]
# 获取指定区间内的成员，按 score 值递减排序，score 相同时按字典序排序
zrevrange [key] [start end]
```

## 持久化

Redis 有两种持久化方式：一种为 RDB 方式，RDB 保存某一时间点之前的数据；另一种为 AOF 方式，AOF 保存的是 Redis 服务器端执行的每一条命令。

### RDB

RDB 快照有两种触发方式，其一为通过配置参数，例如在配置文件中写入如下配置：

```ini
save 60 1000 # 60 秒内如果有 1000 个 key 发生变化，就会触发一次 RDB 的快照
```

其二是通过在客户端执行`bgsave`命令，显式触发一次 RDB 快照。该函数 fork 一个子进程执行 rdbSave 函数进行实际的快照存储工作，而父进程可以继续处理客户端请求。当子进程退出后，父进程调用相关回调函数进行后续处理。

### AOF

AOF 是 Redis 的另一种持久化方式。简单来说，AOF 就是将 Redis 服务端执行过的每一条命令都保存到一个文件，当 Redis 重启时，只要按顺序回放这些命令就会恢复到原始状态。

### 取舍

RDB 保存的是一个时间点的快照，如果发生故障，丢失的就是从最后一次 RDB 执行的时间点到故障发生的时间间隔内产生的数据。如果 Redis 数据量很大，QPS 很高，那么执行一次 RDB 需要的时间会相应增加，发生故障时丢失的数据也会增多。

而 AOF 保存的是一条条命令，理论上可以做到发生故障时只丢失一条命令。但是由于操作系统中执行写文件操作代价很大。

由此可以看出，RDB 保存的是最终的数据，是一个最终状态；而 AOF 保存的是达到这个最终状态的过程。可以通过 Redis 配置参数，通过对安全性和性能的折中，设置不同的策略。

## 主从复制

用户可以通过执行`slaveof`命令或在配置文件中设置 slaveof 选项来开启主从复制功能。例如现有两台服务器——`127.0.0.1:6379`和`127.0.0.1:7000`，向服务器`127.0.0.1:6379`发送下面命令：

```shell
slaveof 127.0.0.1 7000 #当前服务器成为 127.0.0.1:7000 的从服务器
```

### 优势

- 读写分离：单台服务器能支撑的 QPS 是有上限的，通过部署主从服务器，分别处理写、读请求，提升 Redis 的服务能力；并且可以通过复制功能让主服务器免于执行持久化操作：关闭主服务器的持久化，让从服务器去执行持久化操作。
- 数据容灾：通过主从复制功能，保持数据同步，提升服务的可靠性。一旦主服务器宕机，可立即切换至从服务器，避免 Redis 服务中断。

## 哨兵和集群

哨兵是 Redis 的高可用方案，可以在 Redis Master 发生故障时自动选择一个 Redis Slave 切换为 Master，继续对外提供服务，保证服务器不出现单点故障。

集群提供数据自动分片到不同节点的功能，并且当部分节点失效后仍然可以使用。

### 哨兵

实际中至少会部署 3 个哨兵，并且哨兵数量最好是奇数。有以下原因：

1. 只部署 1 个的话，哨兵本身就成为了一个单点
2. 哨兵个数为偶数时，可能发生选 leader 时平票的情况

### 集群

集群用来提供横向扩展的能力，即当数据量增多时，通过增加服务节点就可以扩展服务能力。背后的理论思想是将数据通过某种算法分布到不同的服务节点，当节点越多时，单台节点所需提供服务的数据就越少。集群解决了以下问题：

1. 分槽（slot）：即如何决定某条数据应该由哪个节点提供服务
   1. Redis 将键空间分为了 16384 个 slot，并通过指定算法计算出每个 key 所属的 slot
   2. 算法：`HASH_SLOT = CRC16(key) mod 16384`
2. 端向集群发起请求的方式：客户端并不知道某个数据应该由哪个节点提供服务，并且扩容或者节点发生故障后，不应该影响客户端的使用
   1. 实际应用中，Redis 客户端可以通过向集群请求 slot 和节点的映射关系并缓存，然后通过本地计算要操作的 key 所属的 slot，查询映射关系，直接向正确的节点发起请求，这样可以获得几乎等价于单节点部署的性能
3. 节点发生故障后，该节点服务的数据的处理方式
   1. 当集群由于节点故障或扩容导致重新分片后，客户端先通过重定向获取到数据
   2. 每次发生重定向后，客户端可以将新的映射关系进行缓存，下次仍然可以直接向正确的节点发起请求
4. 扩容：即向集群中添加新节点的方式
5. 同一条命令需要处理的 key 分布在不同节点时的解决方案
   1. 当一条命令需要操作的 key 分属于不同节点时，Redis 会报错
   2. Redis 提供了一种被称为 hash tags 的机制，由业务方保证，当需要进行多个 key 的处理时，将所有 key 分布到同一个节点，该机制实现原理如下：
      1. 如果一个 key 包含 {substring} 这种模式，则计算 slot 时只计算 `{` 和 `}` 之间的子字符串
      2. 即 `keys{sub}1`、`keys{sub}2`、`keys{sub}3`等计算 slot 时，都会按照 sub 串进行
      3. 这样保证这三个字符串会分布到同一节点



## 一些理解

### 消息处理的触发机制

- **死循环方式读取处理**：让一个死循环的程序不断地读取一个队列，并且进行后期处理，这种方式失效性是比较强的，因为这种程序不断地扫描消息队列，因此消息队列里一旦有数据，就可以进行后续处理。但是这样会造成服务器压力，最关键的是也不会知道程序什么时候会挂掉，一旦出现故障，没办法及时恢复，这种情况比较适合做秒杀，因为秒杀的时间点比较集中，一旦有秒杀可以立即处理。

- **定时任务**：每隔几秒或者几分钟执行一次，这样做的最大好处就是把压力分开了，无论入队的系统在哪个时间点入队的峰值是多么不平均，但由于出队的系统是定时执行的，所以会把压力均摊，每个时间点的压力会差不太多，所以还是比较流行的，尤其是订单系统和物流配货系统这类的，如订单系统会把写入队列，用户就可以看到我的订单在等物流配货了，这样物流系统就会定时把订单进行汇总处理，这样压力就不会太大，唯一的缺点就是定时和间隔和数量要把握好，不要等上一个定时任务没有执行完呢，下一个定时任务又开始了，这样容易出现不可预测的问题。

  > 守护进程：类似于PHP-FPM和PHP-CGI进程，需要linux的shell基础。 

### 案例

1. **解耦案例**：队列处理订单系统和配送系统
   在网购的时候，提交订单之后，看到自己的订单货物在配送中，这样就参与进来一个系统是配送系统，如果我们在做架构的时候，把订单系统和配送系统设计到一起，就会出现问题。首先对于订单系统来说，订单系统处理压力较大，对于配送系统来说没必要对这些压力做及时反映，我们没必要在订单系统出现问题的情况下，同时配送系统出现问题，这时候就会同时影响两个系统的运转，我们可以解耦解决。这两个系统分开之后，我们可以通过一个队列表来实现两个系统的沟通。首先，订单系统会接收用户的订单，进行订单的处理，会把这些订单写到队列表中，这个队列表是沟通两个系统的关键，由配送系统中的定时执行的程序来读取队列表进行处理，配送系统处理之后，会把已经处理的记录进行标记，这就是流程。

2. **流量削峰案例**：Redis 的 List 类型实现秒杀

   为什么要使用 Redis 而不适用 Mysql 呢？

   因为 Redis 是基于内存，速度要快很多，而 Mysql 需要往硬盘里写，因为其他业务还要使用 Mysql，如果秒杀使用 Mysql 的话，会把 Mysql 的资源耗光，这样其他的业务在读取 Mysql 肯定出问题。另外 Redis 对数据有一个持久化作用，这样要比 Memcache 要有优势，并且数据类型要多，这次要用的就是 Redis 的 List，可以向头部或者尾部向 Redis 的链表增加元素，这样 Redis 在实现一个轻量级的队列非常有优势。
