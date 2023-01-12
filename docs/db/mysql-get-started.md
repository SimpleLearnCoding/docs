# MySQL

> 概要：案例形式对 MySQL 的索引优化、查询优化等做出说明。



## Docker



```bash
$ docker rm -f learning-mysql

# 使用数据映射时，请注意写入权限
$ rm -rf "$PWD/data/mysql" \
  && chmod 777 "$PWD/docker-data" && chmod 777 "$PWD/docker-conf" \
  && docker rm -f learning-mysql && docker run \
  -p 3311:3306 \
  -v "$PWD/docker-data/mysql":/var/lib/mysql \
  -v "$PWD/docker-conf/mysql/my.conf":/etc/mysql/my.conf \
  --name learning-mysql \
  -e MYSQL_ROOT_PASSWORD=linnzh \
  -d mysql:8.0 \
  --lower_case_table_names=1 \
  --slow-query-log=1 \
  --authentication_policy=mysql_native_password \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci


# 使用绝对路径（Windows）
$ cd /c/Docker/mysql && rm -rf "$PWD/data" \
  && chmod 666 "$PWD/data" && chmod 666 "$PWD/conf" \
  && docker rm -f learning-mysql && docker run \
  -p 3311:3306 \
  -v "$PWD/data":/var/lib/mysql \
  -v "$PWD/conf":/etc/mysql \
  --name learning-mysql \
  -e MYSQL_ROOT_PASSWORD=linnzh \
  -d mysql:8.0 \
  --lower_case_table_names=1 \
  --slow-query-log=1 \
  --authentication_policy=mysql_native_password \
  --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_unicode_ci

# 查询 mysql 配置（及含义）
$ docker run -it --rm mysql:8.0 --verbose --help

# Windows 可用 sh 而不是其他
# docker exec -it learning-mysql sh
$ docker exec -it learning-mysql /bin/sh

```



## 概念



### 权限机制



> MySQL 用户主机字符串通配符`%`不包括`localhost`。`localhost`和IP地址`127.0.0.1`并不等同，如果使用`mysql -uroot -h localhost`，则默认会去连接 socket 文件。
>
> 如果我们要连接TCP 端口，正确的写法应该是`mysql -uroot -h 127.0.0.1`。



```sql
# 切换数据库
mysql> use mysql;
Database changed

# 查看用户
# 这里有两个名为 root 的用户，但是其 host 不同
# user 表以 user + host 为联合主键
mysql> select user,host,plugin from user;
+------------------+-----------+-----------------------+
| user             | host      | plugin                |
+------------------+-----------+-----------------------+
| root             | %         | mysql_native_password |
| mysql.infoschema | localhost | caching_sha2_password |
| mysql.session    | localhost | caching_sha2_password |
| mysql.sys        | localhost | caching_sha2_password |
| root             | localhost | mysql_native_password |
+------------------+-----------+-----------------------+
5 rows in set (0.01 sec)

# 查看当前用户
mysql> select current_user();
+----------------+
| current_user() |
+----------------+
| root@%         |
+----------------+
1 row in set (0.01 sec)


# 查看指定用户的所有权限
-- ⚠️ host 部分必须使用 引号 包裹
mysql> show grants for root@'%';

# 创建用户
mysql> create user 'linnzh' identified with mysql_native_password by 'linnzh_pwd';
Query OK, 0 rows affected (0.05 sec)

# 授予权限
# ref: https://dev.mysql.com/doc/refman/8.0/en/grant.html
mysql> create database `study`;
Query OK, 1 row affected (0.04 sec)

mysql> grant select,insert,update,delete on study.* to 'linnzh'@'%';
Query OK, 0 rows affected (0.02 sec)
 
mysql> show grants for linnzh@'%';
+-------------------------------------------------------------------+
| Grants for linnzh@%                                               |
+-------------------------------------------------------------------+
| GRANT USAGE ON *.* TO `linnzh`@`%`                                |
| GRANT SELECT, INSERT, UPDATE, DELETE ON `study`.* TO `linnzh`@`%` |
+-------------------------------------------------------------------+
2 rows in set (0.01 sec)

# 修改密码
# ref: https://dev.mysql.com/doc/refman/8.0/en/alter-user.html
mysql> alter user 'linnzh'@'%' identified with mysql_native_password BY 'new_password';
```



#### 安全

- 使用更安全的算法加密密码，一些流行算法，如 MD5 已经被证明是弱加密，不适合用于加密密码。曾经比较流行的散列算法 SHA-1 也被证明不够安全。

  推荐的方式是**在将密码传入散列函数进行加密之前，将其和一个无意义的字符串拼接在一起**，这样即使用户选择了一个在字典中存在的单词作为密码，攻击者也很难使用字典攻击的手段破解密码。



研发人员、测试人员也有必要熟悉目前常用的一些攻击手段的原理和预防，如会话（session）劫持、中间人攻击、SQL注入、跨站脚本攻击等。

1. **会话劫持**：由于 HTTP 是无状态的，客户端到服务器端并不需要维持一个连接，因此需要有一种关联的手段，基于此，服务器会给新的会话一个标识信息：cookie。在 PHP 环境中，cookie 默认是存储在`/tmp`下的。生成的用以标识客户信息的 cookie 一般被称为`session id`，用户发出请求时，所发送的 HTTP 请求 header 内包含了 session id 的值，可用 firebug 查看这个值。服务器使用 session id 来识别是哪个用户提交的请求。session 保存的是每个用户的个人数据，一般的 Web 应用程序会使用 session 来保存通过验证的用户账号和密码。在转换不同的网页时，如果需要验证用户的身份，就要用 session 内所保存的账号和密码来比较。

   攻击者通过一些手段来获取其他用户 session id 的攻击就叫**Session劫持**。一个典型的场景是在未加密的 Wi-Fi 网络中，由于 session id 在用户的请求内而且是不加密的（未使用HTTPS），通过嗅探工具可以获取到用户的 session id，然后可以冒充用户进行各种操作。**除了嗅探外，还有一些其他的手段，如跨站脚本攻击、暴力破解、计算等**。

   如果使用了 HTTPS 加密传输，那么理论上可以防止嗅探，但实际上，HTTPS 在世界范围内远未普及开来，许多网站登录的时候使用了 HTTPS，登录成功后仍然返回了 HTTP 会话，一些网站虽然支持 HTTPS，但并不作为默认选项。**因为HTTPS无法实现缓存、响应变得缓慢、运营成本高、虚拟主机无法在同一台物理服务器上为多个网站提供服务、和其他不支持HTTPS应用的交互，以上种种因素都制约着HTTPS的普及。**

2. **中间人攻击**：中间人攻击是指攻击者在通信的两端分别创建独立的连接，并交换其所收到的数据，使通信的两端认为他们正在通过一个私密的连接与对方直接对话，但事实上整个会话都被攻击者完全控制（例如，在一个未加密的Wi-Fi无线接入点的中间人攻击者，可以将自己作为一个中间人插入这个网络）。

   中间人攻击能够成功的一个前提条件是攻击者能将自己伪装成每一个参与会话的终端，并且不被其他终端识破。大多数的加密协议都专门加入了一些特殊的认证方法以阻止中间人攻击。例如，SSL协议可以验证参与通信的一方或双方使用的证书是否由权威的受信任的数字证书认证机构颁发，并且能执行双向身份认证。

3. **跨站脚本攻击**：指攻击者利用网站程序对用户输入过滤不足，输入可以显示在页面上对其他用户造成影响的 HTML 代码，从而盗取用户资料、利用用户身份进行某种动作，或者对访问者进行病毒侵害的一种攻击方式。针对这种攻击，主要应做好输入数据的验证，对输出数据进行适当的编码，以防止任何已成功注入的脚本在浏览器端运行。

4. **SQL注入（SQL Injection）**：是发生在应用程序中的数据库层的安全漏洞。简而言之，是在输入的字符串之中注入 SQL 语句，如果在设计不良的程序中忽略了检查，那么这些注入进去的 SQL 语句就会被数据库服务器误认为是正常的 SQL 语句而运行，攻击者就可以执行计划外的命令或访问未被授权的数据。SQL注入已经成为互联网世界Web应用程序的最大风险。我们有必要从开发、测试、上线各个环节对其进行防范。



### 数据恢复



MySQL 靠**预写式日志（Write-Ahead Logging，WAL）**来保证持久性，也就是说，数据文件不会马上写入脏数据，而是会先写日志。InnoDB 的脏数据是存在于 innodb_buffer_pool 里的，它会按一定的机制批量刷新到磁盘，这样做可以提高吞吐率。

我们把上面这种日志称为 **redo日志**，即**InnoDB的事务日志**。如果突然断电了，那么 InnoDB 是不能保证数据已经写入磁盘的，数据库重启后，MySQL需要知道当时执行的操作是成功了还是部分成功或失败了这时，只要使用了预写式日志，程序就可以检查 redo 日志，并将突然断电时计划执行的操作内容跟实际上执行的操作内容进行比较。

在这个比较的基础上，MySQL就可以决定是撤销已做的操作还是继续完成相应的操作，或者是保持原样。这就是灾难恢复的过程。



事务日志都是顺序写入的，因此可以设置参数来调整commit（事务提交）时写入事务日志的频率。MySQL的事务日志刷新可能会出现如下3种情况：

1. innodb_flush_log_at_trx=1

   每次 commit 时都写入磁盘。这样理论上我们只会丢失一个事务。

2. innodb_flush_log_at_trx=2

   每次 commit 时，写日志只缓冲（buffer）到操作系统缓存，但不刷新到磁盘，InnoDB 会每秒刷新一次日志，所以宕机丢失的是最近 1 秒的事务。**生产环境中建议使用此配置**。

3. innodb_flush_log_at_trx=0

   每秒把日志缓冲区的内容写到日志文件，并且刷新到磁盘，但 commit 时什么也不做。



### 慢查询



MySQL 的慢查询日志比较粗略，主要是基于以下3项基本的信息：

- Query_time：查询耗时
- Rows_examined：检查了多少条记录
- Rows_sent：返回了多少行记录（结果集）

以上3个值可以大致衡量一条查询的成本。其他信息包括如下几点：

- Time：执行SQL的开始时间
- Lock_time：等待table lock的时间，注意InnoDB的行锁等待是不会反应在这里的
- User@Host：执行查询的用户和客户端IP



慢查询日志可以用来找到执行时间很长的查询，可以用于优化。但是，检查又长又慢的查询日志会很困难。要想使其变得容易些，可以使用`mysqldumpslow`命令获得慢查询日志摘要来处理慢查询日志，或者使用更好的第三方工具`pt-query-digest`。



```sql
# 查看慢查询是否开启，以及慢查询日志位置
mysql> show variables like '%query_log%';
+------------------------------+--------------------------------------+
| Variable_name                | Value                                |
+------------------------------+--------------------------------------+
| binlog_rows_query_log_events | OFF                                  |
| slow_query_log               | ON                                   |
| slow_query_log_file          | /var/lib/mysql/4c8044aa7817-slow.log |
+------------------------------+--------------------------------------+
3 rows in set (0.03 sec)

# 查看慢查询执行超时时间（全局变量）
# 超过该时长的 SQL 语句都会被记录在慢查询日志里
mysql> show variables like '%query_time%';
+-----------------+-----------+
| Variable_name   | Value     |
+-----------------+-----------+
| long_query_time | 10.000000 |
+-----------------+-----------+
1 row in set (0.03 sec)


```





### 特殊处理



#### NULL 值

使用`DISTINCT`、`GROUP BY`或`ORDER BY`时，所有`NULL`值将被视为是等同的。使用`ORDER BY`时，首先将显示`NULL`值，如果指定了`DESC`按降序排列，那么`NULL`值将在最后面显示。对于聚合（累计）函数，如`COUNT()`、`MIN()`和`SUM()`，将忽略`NULL`值。**对此的例外是`COUNT(*)`，它将计数行而不是单独的列值。**

对于某些列类型，MySQL将对`NULL`值进行特殊处理。如果将`NULL`值插入 TIMESTAMP 列，那么将插入当前日期和时间。如果将`NULL`值插入具有 AUTO_INCREMENT 属性的整数列，那么将插入序列中的下一个编号。

`NULL`值可能会导致 MySQL 的优化变得复杂，所以，**一般建议字段应尽量避免使用 NULL 值**。



#### 多表更新



```sql
# 假定我们有两张表，一张表为 product 表，存放产品信息，其中有产品价格列price；
# 另外一张表是 product_price 表，要将 product_price 表中的价格字段 price 更新为 product 表中价格字段 price 的 80%

# 方案1
mysql> UPDATE `product` p, `product_price` pp
SET pp.`price` = p.`price` * 0.8 
WHERE p.`productId` = pp.`productId`;

# 方案2:使用INNER JOIN然后更新
mysql> UPDATE `product` p
INNER JOIN `product_price` pp ON p.`productId` = pp.`productId`
SET pp.`price` = p.`price` * 0.8;

# 方案3:使用LEFT JOIN来做多表UPDATE，如果product_price表中没有产品价格记录的话，将product表的isDeleted字段设置为1
mysql> UPDATE `product` p
LEFT JOIN `product_price` pp ON p.`productId` = pp.`productId`
SET p.`deleted` = 1 
WHERE pp.`productId` IS NULL;

# 方案4:使用 INNER JOIN 同时更新两张表
mysql> UPDATE `product` p
INNER JOIN `product_price` pp ON p.`productId` = pp.`productId`
SET pp.`price` = p.`price` * 0.8, p.`dateUpdate` = CURDATE();

```



#### 使用 CASE 条件更新



```sql
# 用 CASE 表达式的条件分支进行的更新操作是一气呵成的，因此可以避免出现如覆盖更新、主键重复、使用临时值等所导致的错误

-- 用 CASE 表达式写正确的更新操作
UPDATE `Salaries`
SET `salary` = (CASE WHEN `salary` >= 300000 THEN `salary` ＊ 0.9 WHEN `salary` >= 250000 AND `salary` < 280000 THEN `salary` ＊ 1.2 ELSE `salary` END);

-- 用CASE表达式调换值
UPDATE `SomeTable` 
SET `p_key` = (CASE WHEN `p_key`='a' THEN 'b' WHEN `p_key`='b' THEN 'a' ELSE `p_key` END) WHERE `p_key` IN ('a','b');
```





### 事务和锁



事务是数据库管理系统执行过程中的一个逻辑单元，由有限的操作序列构成。

事务隔离级别越高，越能保证数据的完整性和一致性，但是对并发性能的影响也会越大。MySQL事务包含如下4个隔离级别，按隔离级别从低到高排列如下：

1. read uncommitted（dirty read），也称为**读未提交**，事务可以看到其他事务更改了但还没有提交的数据，即存在脏读的情况。

2. read committed，也称为**读提交**，事务可以看到在它执行的时候，其他事务已经提交的数据，已被大部分数据库系统采用。允许不可重复读，但不允许脏读。示例如下：

   ```sql
   begin transaction;
   select a from b where c=1;
   ...  #其他事务更改了这条记录,并且commit提交
   select a from b where c=1;   #可以看到新的数据，不可重复读
   end
   ```

3. repeatable read，也称为**可重复读**。同一个事务内，同一个查询请求，若多次执行，则获得的记录集是相同的，但不能杜绝幻读，示例如下：

   ```sql
   begin transaction
   select a from b where c=1;
   ...   #其他事务更改了这条记录,并且commit
   select a from b where c=1;   #仍然看到旧的数据,可重复读,但不能杜绝幻读
   end
   ```

   发生幻读的场景有，某事务 A 按某个条件进行查询，此时尚未提交。然后另一个事务成功插入了数据。事务 A 再次查询时，可能会读取到新插入的数据。

MySQL InnoDB 引擎默认使用的是`repeatable read`（可重复读）。当事务 A 发出一个一致性读之时，即一个普通的 SELECT 语句，InnoDB 将给事务A一个时间点。如果另一个事务在该时间点被指定之后删除一行并提交，则事务 A 看不到该行已被删除。插入和更新的处理与此相似。

可以通过提交事务来前进时间点，然后进行另一个SELECT。这被称为**多版本并发控制**（multi-versioned concurrency control）。如果想要查看数据库的最新状态，应该用`READ COMMITTED`隔离级别或用一个锁定读`SELECT*FROM t LOCK IN SHARE MODE;`。

为了满足可重复读，事务开启后，对于要查询的数据，需要保留旧的行版本，以便重新查询，这在一些特殊的环境中可能会导致某些问题，比如一些框架，对于任何操作，都要先进入`AUTOCOMMIT=0`的模式，直到有写入时才会进行 COMMIT 提交，这可能会导致事务数过多，有时由于框架或编码的不完善，可能会出现长时间不提交的事务，导致 UNDO 保留的旧的数据记录迟迟不能被删除，还可能导致UNDO 空间暴涨。对于这些极端情况，首先应该考虑调整应用，实在没有办法的话，可以考虑将事务的隔离模式更改为`read committed`。



```sql
# 查询当前的事务隔离级别
mysql> show variables like '%tx%';

# 设置事务的隔离级别 - InnoDB 默认为 repeatable read（可重复读）
mysql> set global transaction isolation level repeatable read;
```



InnoDB 有几种不同类型的行锁技术，如**记录锁（record lock）**、间隙锁（gap lock），和**next-key锁**。

- 记录锁（index-row locking）：这是一个索引记录锁。它是建立在索引记录上的锁，很多时候，扫描一个表，由于无索引，往往会导致整个表被锁住，建立合适的索引可以防止扫描整个表。

- 间隙锁：这是施加于索引记录间隙上的锁。

- next-key锁：记录锁加间隙锁的组合。也就是说 **next-key锁技术包含了记录锁和间隙锁**。

  需要留意的是，next-key锁是为了防止发生幻读，而**只有repeatable read及以上隔离级别才能防止幻读**，所以在read committed隔离级别下面没有next-key锁这一说法。



#### 死锁



**死锁**是指两个或两个以上的事务在执行过程中，因争夺资源而造成的一种互相等待的现象，若无外力作用，它们都将无法进行下去。

理论上，产生死锁有4个必要条件：

- 禁止抢占（no preemption）
- 持有和等待（hold and wait）
- 互斥（mutual exclusion）
- 循环等待（circular waiting）

预防死锁就是至少破坏这4个条件中的一项，即破坏“禁止抢占”、“持有等待”、“资源互斥”或“循环等待”。



对于MySQL死锁的解决，通常有如下方法：

- 经常提交你的事务。小事务更少地倾向于冲突。
- 以固定的顺序访问你的表和行。这样事务就会形成定义良好的查询并且没有死锁。
- 将精心选定的索引添加到你的表中。这样你的查询就只需要扫描更少的索引记录，并且因此也可以设置更少的锁定。
- 不要把无关的操作放到事务里面。
- 在并发比较高的系统中，不要显式加锁，特别是在事务里显式加锁。如SELECT…FOR UPDATE语句，如果是在事务里（运行了START TRANSACTION或设置了autocommit等于0），那么就会锁定所查找到的记录。
- 尽量按照主键/索引去查找记录，范围查找增加了锁冲突的可能性，也不要利用数据库做一些额外的计算工作。比如有些读者会用到“SELECT…WHERE…ORDER BY RAND();”这样的语句，由于类似这样的语句用不到索引，因此将导致整个表的数据都被锁住。
- 优化SQL和表设计，减少同时占用太多资源的情况。比如说，减少连接的表，将复杂SQL分解为多个简单的SQL。



<!--### 存储过程/触发器/函数/视图-->

### 存储过程 - Stored Procedure



一组可编程的函数，是为了完成特定功能的SQL语句集，经编译创建并保存在数据库中，用户可通过指定存储过程的名字并给定参数(需要时)来调用执行。

#### 优点：

1. 将重复性很高的一些操作，封装到一个存储过程中，简化了对这些SQL的调用

2. 批量处理：SQL+循环，减少流量，也就是“跑批”

3. 统一接口，确保数据的安全

相对于 oracle 数据库来说，MySQL 的存储过程相对功能较弱，使用较少。



```sql
# ref: https://dev.mysql.com/doc/refman/8.0/en/create-procedure.html
# 示例来源：https://segmentfault.com/a/1190000018335749
# 更多示例：https://www.cainiaojc.com/note/qa3196.html

mysql> create database stored_procedure;
Query OK, 1 row affected (0.03 sec)

mysql> use stored_procedure;
Database changed

mysql> CREATE TABLE `dim_date` (
  `id` int(8) NOT NULL DEFAULT '0',
  `key` date NULL DEFAULT NULL,
  `year` int(4) NOT NULL,
  `quarter` int(1) NOT NULL,
  `month` int(2) NOT NULL,
  `week` int(1) NOT NULL COMMENT '星期',
  `weekofyear` int(2) NOT NULL COMMENT '一年中的第几周',
  `day` int(2) NOT NULL COMMENT '日',
  `dayofyear` int(3) NOT NULL COMMENT '一年总的第几天',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
Query OK, 0 rows affected (0.07 sec)

# 定义存储过程 —— getAllDate
# 生成了以当前日期为基准前后3650天的日期记录
mysql> DELIMITER //
DROP PROCEDURE IF EXISTS getAllDate;

CREATE PROCEDURE getAllDate()
BEGIN
    DECLARE count int DEFAULT 0;
    DECLARE startDay DATE DEFAULT DATE(NOW());
    DECLARE endDay DATE DEFAULT DATE(NOW());
    -- 定义异常处理方式  http://www.cnblogs.com/cookiehu/p/4994278.html
    DECLARE out_status VARCHAR(200) DEFAULT 'OK';
    DECLARE CONTINUE HANDLER  
    FOR 1062
    SET out_status = 'Duplicate Entry';
    -- 异常处理方式完毕
    WHILE count < 3650 DO
            INSERT INTO `dim_date`(`id`, `key`, `year`, `quarter`, `month`, `week`, `weekofyear`, `day`, `dayofyear`) VALUES (cast(DATE_FORMAT(startDay,'%Y%m%d') as UNSIGNED), startDay, YEAR(startDay), QUARTER(startDay), MONTH(startDay), WEEKDAY(startDay) + 1, week(startDay, 1), DAY(startDay), DAYOFYEAR(startDay));
            SET count = count + 1;
            SET startDay = DATE_ADD(DATE(NOW()), INTERVAL COUNT DAY);
            SET endDay = DATE_SUB(DATE(NOW()), INTERVAL COUNT DAY);
            INSERT INTO `dim_date`(`id`, `key`, `year`, `quarter`, `month`, `week`, `weekofyear`, `day`, `dayofyear`) VALUES (cast(DATE_FORMAT(endDay,'%Y%m%d') AS UNSIGNED), endDay, YEAR(endDay), QUARTER(endDay), MONTH(endDay), WEEKDAY(endDay) + 1, week(endDay, 1), DAY(endDay), DAYOFYEAR(endDay));
    END WHILE;
END //

DELIMITER ;

Query OK, 0 rows affected (0.04 sec)
Query OK, 0 rows affected (0.04 sec)

# 调用存储过程
mysql> call getAllDate();
Query OK, 1 row affected (14.94 sec)

mysql> select count(*) from dim_date where year = 2022;
+----------+
| count(*) |
+----------+
|      365 |
+----------+
1 row in set (0.01 sec)
```



## 查询优化





### 基础



一般常用的查询优化策略有**优化数据访问**、**重写SQL**、**重新设计表**、**添加索引**4种。



#### 优化数据访问



应该尽量减少对数据的访问。一般有如下两个需要考虑的地方：应用程序应减少对数据库的数据访问，数据库应减少实际扫描的记录数。

- 优先读取缓存（如果有缓存）
- 仅读取需要的列，避免`SELECT *`查询
- 添加索引或增加筛选条件来避免扫描大量数据



#### 重写SQL



由于复杂查询严重降低了并发性，因此为了让程序更适于扩展，我们可以把复杂的查询分解为多个简单的查询。一般来说多个简单查询的总成本是小于一个复杂查询的。

对于需要进行大量数据的操作，可以分批执行，以减少对生产系统产生的影响，从而缓解复制超时。

由于MySQL连接（JOIN）严重降低了并发性，对于高并发，高性能的服务，应该尽量避免连接太多表，如果可能，对于一些严重影响性能的SQL，建议程序在应用层就实现部分连接的功能。

这样的好处是：可以更方便、更高效地缓存数据，方便迁移表到另外的机器，扩展性也更好。



#### 重新设计表



有些情况下，我们即使是重写SQL或添加索引也是解决不了问题的，这个时候可能要考虑更改表结构的设计。**比如，可以增加一个缓存表，暂存统计数据，或者可以增加冗余列，以减少连接**。优化的主要方向是进行反范式设计。

重新设计表时，要考虑到历史数据问题，可以使用批处理脚本来进行“弥补”。



#### 添加索引



生产环境中的性能问题，可能80%的都是索引的问题，所以优化好索引，就已经有了一个好的开始。



### 语句优化



#### 连接优化

由于连接的成本比较高，因此对于高并发的应用，应该尽量减少有连接的查询，连接的表的个数不能太多，连接的表建议控制在4个以内。

- ON、USING 子句中的列确认有索引。如果优化器选择了连接的顺序为B、A，那么我们只需要在A表的列上创建索引即可。

- 最好是能转化为`INNER JOIN`，`LEFT JOIN`的成本比`INNER JOIN`高很多。

- 使用`EXPLAIN`检查连接，留意`EXPLAIN`输出的`rows`列，如果`rows`列太高，比如几千，上万，那么就需要考虑是否索引不佳或连接表的顺序不当。

- 反范式设计，这样可以减少连接表的个数，加快存取数据的速度。

- 考虑在应用层实现连接。

  对于一些复杂的连接查询，更值得推荐的做法是：将它分解为几个简单的查询，可以先执行查询以获得一个较小的结果集，然后再遍历此结果集，最后根据一定的条件去获取完整的数据。这样做往往是更高效的，因为我们把数据分离了，更不容易发生变化，更方便缓存数据，数据也可以按照设计的需要从缓存或数据库中进行获取。

  **同时，把 IN 列表分解为等值查找，往往可以提高性能。**

- 一些应用可能需要访问不同的数据库实例，这种情况下，在应用层实现连接将是更好的选择。

#### 排序优化

- 需要保证索引列和 ORDER BY 的列相同，且各列均按相同的方向进行排序。

- 指定`ORDER BY NULL`

  默认情况下，MySQL将排序所有 GROUP BY 的查询，如果想要避免排序结果所产生的消耗，可以指定 ORDER BY NULL。

- 优化`GROUP BY WITH ROLLUP`

  `GROUP BY WITH ROLLUP`可以方便地获得整体分组的聚合信息（super aggregation），但如果存在性能问题，可以考虑在应用层实现这个功能，这样往往会更高效，伸缩性也更佳。

#### 子查询优化

- 对于数据库来说，在绝大部分情况下，**连接会比子查询更快**。

  使用连接的方式，MySQL优化器一般可以生成更佳的执行计划，可以预先装载数据，更高效地处理查询。而子查询往往需要运行重复的查询，子查询生成的临时表上也没有索引，因此效率会更低。

#### Limit 优化

分页算法经常需要用到`LIMIT offset,row_count ORDER BY col_id`之类的语句。**一旦 offset 的值很大，效率就会很差**，因为MySQL必须检索大量的记录（offset+row_count），然后丢弃大部分记录。

- 限制页数，只显示前几页，超过了一定的页数后，直接显示“更多（more）”，一般来说，对于N页之后的结果，用户一般不会关心。

- 要避免设置offset值，也就是避免丢弃记录。

  例如，按照id排序（id列上有索引），通过增加一个定位的列`id > 990`，可以避免设置 offset 的值。

- 使用`INNER JOIN`

  先按照索引排序获取到id值，然后再使用 JOIN 补充其他列的数据。

  ```sql
  SELECT id, name, address, phone
  FROM customers
    INNER JOIN (
          SELECT id
          FROM customers
          ORDER BY name
          LIMIT 999,10) AS my_results USING(id);
  ```



#### IN 优化



对于 IN 列表，**MySQL会排序 IN 列表里的值**，并使用二分查找（Binary Search）的方式去定位数据。

**把 IN 子句改写成 OR 的形式并不能提高性能**。IN 列表不宜过长，最好不要超过200；对于高并发的业务，小于几十为佳。



#### UNION 优化



`UNION`语句默认是移除重复记录的，需要用到排序操作，如果结果集很大，成本将会很高，所以，建议尽量使用`UNION ALL`语句。另外，查询语句外层的 WHERE 条件，并不会应用到每个单独的UNION 子句内，所以，应在每一个 UNION 子句中添加上WHERE条件，从而尽可能地限制检索的记录数。



#### 临时表优化



如果不能利用索引排序，那么我们在 MySQL 中可能需要创建一个临时表用于排序。

MySQL 的临时表分为“内存临时表”和“磁盘临时表”，其中，内存临时表使用 MySQL 的 MEMORY 存储引擎，磁盘临时表使用 MySQL 的 MyISAM 存储引擎。

一般情况下，MySQL 会先创建内存临时表，但当内存临时表超过配置参数指定的值后，MySQL会将内存临时表导出到磁盘临时表。

触发以下条件，会创建临时表：

- ORDER BY 子句和 GROUP BY 子句引用的列不一样。
- 在连接查询中，ORDER BY 或 GROUP BY 使用的列不是连接顺序中的第一个表。
- ORDER BY 中使用了 DISTINCT 关键字。

通过 EXPLAIN 的 Extra 列可以查看是否用到了临时表：“Using temporary”表示使用了临时表。

使用临时表一般意味着性能会比较低，特别是使用磁盘临时表时，性能将会更慢，因此我们在实际应用中应该尽量避免临时表的使用。

常见的避免临时表的方法有如下3点：

- 创建索引：在ORDER BY或GROUP BY的列上创建索引。
- 分拆长的列：一般情况下，TEXT、BLOB，大于512字节的字符串，基本上都是为了显示信息，而不会用于查询条件，因此设计表的时候，可以考虑将这些列分离到另外一张表中。
- 不需要用 DISTINCT 时就没必要用 DISTINCT，能用 UNION ALL 就不要用 UNION。



#### 索引优化



- 建议索引中的字段数量不要超过 5 个。
- 单张表的索引数量建议控制在 5 个以内。
- 唯一键和主键不要重复。
- 索引字段的顺序需要考虑字段唯一值的个数，**选择性高（唯一性强）的字段**一般放在前面。
- ORDER BY、GROUP BY、DISTINCT的字段需要放在复合索引的后面，也就是说，复合索引的前面部分用于等值查询，后面的部分用于排序。
- 使用 EXPLAIN 判断SQL语句是否合理使用了索引，尽量避免 Extra 列出现 Using File Sort，Using Temporary。
- UPDATE、DELETE 语句需要根据 WHERE 条件添加索引。
- 建议不要使用`like '%value'`的形式，因为MySQL仅支持最左前缀索引。
- 对长度过长的 VARCHAR 字段（比如网页地址）建立索引时，需要增加散列字段，对VARCHAR使用散列算法时，散列后的字段最好是整型，然后对该字段建立索引。
- 存储域名地址时，可以考虑采用反向存储的方法，比如把 news.sohu.com 存储为 com.sohu.news，方便在其上构建索引和进行统计。
- 合理地创建复合索引，复合索引(a,b,c)可以用于`where a=?`、`where a=? and b=?`、`where a=? and b=? and c=?`等形式，但对于`where a=?`的查询，可能会比仅仅在a列上创建单列索引查询要慢，因此需要在空间和效率上达成平衡。
- 合理地利用**覆盖索引**。由于覆盖索引一般常驻于内存中，因此可以大大提高查询速度。
- **把范围条件放到复合索引的最后**，WHERE条件中的范围条件（BETWEEN、<、<=、>、>=）会导致后面的条件使用不了索引。



## 一些关于测试的 Tips 



很多软硬件厂商官方测试结果的数据指标都非常好，但这些往往都是不可信的，它们可能经过了特殊的调整来适应基准测试软件，从而回避了自身的不足之处，他们更多是希望展示自己的产品在性能测试中的亮点，因此这些测试结果不太可能适用于真实的世界。

不同的公司有不同的业务特点，所以我们**有必要建立自己的测试基准，保存自己的历史测试数据，以便衡量不同的主机、软件、架构及不同时期的性能数据**。虽然很难实现完全适合自己的业务模型，但至少能提供一个相对可靠的模型，可以用作采购机器、选择数据库产品、启用数据库新特性等的依据。

我们应该对于**系统的可扩展性、不同数据量下的性能吞吐**有一个大概的认识，预先判断瓶颈点可能会出现在哪里。这些认识和判断往往依赖于经验的累计，随着经验的增长，你自然而然会具备一些意识，这个时候，就可以有针对性地进行测试了，可以更有效地利用基准测试数据了。而且，一旦我们产生某个想法，就能知道应该改变哪些软硬件配置来验证自己的想法。

一个好的基准测试，应满足如下的一些要素。

1. **有现实意义**。基准测试需要具有现实意义，工作负荷、样本数据、系统配置应该和我们测试的目的相关，这样才更有实际意义。

2. **具有可观察性、易理解、文档化**。基准测试必须充分文档化，其他人在阅读文档时能够知道你的软硬件环境配置是如何进行测试的，可能还要附上你的配置文件。

   测试结果往往要在一定的上下文中才有意义。

   比如一个数据库的I/O测试可能需要包含如下信息：负载是什么样的？使用了什么软硬件、什么测试工具进行测试？数据库是什么版本？测试环境是如何部署的？数据文件多大？数据写入频率如何？数据文件磁盘空间占比如何？使用何种方式写入数据文件？使用何种方式写日志文件？使用独立表空间还是共享表空间？使用的是什么文件系统？使用的是什么I/O调度算法？磁盘阵列是什么RAID级别？有带电池的RAID卡吗？

   信息记录得越详细越好，不仅方便自己以后参考，也方便其他人对比不同配置下的测试结果。

3. **可运行且具有可重复性**。基准测试是可以重复进行得到类似结果的。所以务必要减少干扰因素，尽可能让其他人可以按照你文档描述的步骤得到一样的结果。

   基于此，我们需要熟悉数据流的各个环节，比如负载均衡设备、Web服务器、数据库服务器、应用服务器、存储设备等，将这些环节映射到我们的模型中，可以帮助我们发现一些之前被忽略的干扰源。

4. **收集足够的信息**。基准测试应该尽可能地收集信息，比如内存占用、I/O性能、CPU性能等。收集尽可能多的信息总是一件好事，因为这样做有利于分析问题和发现问题。

5. **有分析结果**。要对基准测试结果进行分析、看和我们预期的是否一样，和经验常识是否一致。**不能只提供数据而不提供分析结果**。

6. **要对基准测试结果进行解释和说明**。应该说明测试结果中的一些异常状况，比如是否有错误、异常或干扰，如果有一些不可理解的地方，也请描述出来，也许有经验的其他人员可以帮助你进行分析。如果和我们预期的不一致，那么也有可能是我们的测试方法有问题，或者被其他的因素干扰了。



由上，我们可以得知，测试需要**明确目的**，并据此来设计测试模型（加入所有可想到的元素并收集），然后部署测试环境，明确性能指标并加以监控，接着准备测试数据（测试数据应该模拟真实数据、碎片化/不均匀、量大）并执行测试。最后对测试结果进行分析总结和完善。

> 测试需要和各方都进行信息沟通，在充分了解软件的情况下再设计测试场景。



#### 一些常用的测试工具

- 内存测试的工具有：sysbench、stream、RamSpeed、stress等。
- CPU测试的工具有：sysbench、cpuburn、stress等。
- 磁盘测试的工具有：sysbench、iozone等。



### CPU测试

sysbench 命令通过**进行素数运算**来测试CPU的性能。`cpu-max-prime`选项指定了最大的素数为20000，如下：

```sh
$ sysbench --test=cpu --cpu-max-prime=20000 run
```

对于 CPU 的测试，我们要重点关注三个指标：上下文切换（context switch）、运行队列（run queue）和使用率（utilization）。

- 上下文切换：在操作系统中，若要将 CPU 切换到另一个进程，需要保存当前进程的状态并恢复另一个进程的状态：即将当前运行任务转为就绪（或者挂起、删除）状态，让另一个被选定的就绪任务成为当前任务。

  上下文切换包括保存当前任务的运行环境，恢复将要运行任务的运行环境等。过多的上下文切换会给系统造成很大的开销。

- 运行队列：当 Linux 内核要寻找一个新的进程在 CPU 上运行时，需要考虑处于可运行状态的进程，运行队列容纳了系统中所有可运行的进程。

  理想情况下，调度器会让队列中的进程不断运行，如果 CPU 过载，就会出现调度器跟不上系统的情况，从而导致可运行的进程填满队列。

  队列越大，程序执行的时间就越长。`load`用于表示正在等待运行的队列长度，`top`命令可以让我们看到在 1 分钟、5 分钟和 15 分钟内CPU运行队列的大小。这个值越大则表明系统负荷越大。

- 使用率：CPU 使用率可分为以下几个部分。

  - User Time：执行用户进程的时间占全部时间的百分比，通常是期望这个值越高越好。
  - System Time：CPU 内核运行及中断的时间占全部时间的百分比，通常是希望这个值越低越好，系统 CPU 占用率过高时，通常表明系统的某部分存在瓶颈。
  - Wait I/O：I/O 等待的 CPU 时间占全部时间的百分比，**如果 I/O 等待过高，那么说明系统中存在 I/O 瓶颈**。
  - Idle：CPU 处于 Idle 状态的时间占全部时间的百分比。

数据库操作中如果有大量的内存读，比如读取索引、读取InnoDB buffer里的数据，那么往往会表现为CPU瓶颈，内存复制也是如此。



### 内存测试

使用sysbench测试内存的命令如下：

```sh
$ sysbench --test=memory --memory-block-size=8K --memory-total-size=4G run
```

上述参数指定了本次测试的整个过程是在内存中传输4GB的数据量，每个块（block）的大小为8KB。



###  I/O测试

磁盘性能测试可采用hdparm命令，对于上线的服务器，为了简便，可用自带的命令hdparm初步判断磁盘的性能，确定工作是否正常。如果要更可靠地验证磁盘、RAID性能，建议使用专门的测试工具，如iozone或sysbench。



```sh
# 查看某SATA硬盘的设置
$ hdparm /dev/sda

/dev/sda:
  IO_support   =  0 (default 16-bit)
  readonly     =  0 (off)
  readahead    =  256 (on)
  geometry     =  60801/255/63, sectors = 976773168, start = 0
  
 # geometry=60801【柱面数】/255【磁头数】/63【扇区数】，sectors=976773168【总扇区数】，start=0【起始扇区数】
```





## 复制



MySQL 支持单向、异步复制，复制过程中一个服务器充当主服务器，而一个或多个其他服务器充当从服务器。有时我们也称从库为从服务器或从实例，意义上大致是类似的，不需要进行细致的区分。



**基本原理**：在主库的二进制日志里记录了对数据库的变更，从库从主库那里获取日志，然后在从库中重放这部分日志，从而实现数据的同步。基本步骤类似如下：

1. 主服务器将更新写入二进制日志文件，并维护文件的一个索引以跟踪日志循环。
2. 从库复制主库的二进制日志事件到本地的中继日志（relay log）。
3. 从库重放中继日志。

将 从服务器 设置为复制 主服务器 的数据后，它将连接主服务器并等待更新过程。如果主服务器失败，或者从服务器与主服务器之间失去了连接，那么从服务器将保持定期尝试连接，直到它能够继续侦听更新为止。由`--master-connect-retry`选项控制重试间隔，默认时间为60s。如果你想要设置链式复制服务器，那么从服务器本身也可以充当主服务器。



**用途**：复制有很多用途，比如跨 IDC 备份数据、使用读写分离架构扩展读、在从库上进行备份、使用从库测试数据库版本升级，高可用自动故障冗余切换等。生产中使用最广泛的用途无疑是进行数据备份，在备份过程中主服务器可以继续处理更新，并在主库不能提供服务的情况下接管服务。

- 建议将从库配置为只读，因为应用程序可能会配置错误，对从库进行写操作，将会导致数据的不一致性，甚至丢失数据。
- 互为主从的环境，一定要保证同一时刻只写一个数据库。
- **互为主从**的复制模式，需要小心处理好自增键及主键的冲突，程序和表的设计应确保不会导致键冲突。
- 由于存在很多约束和风险，所以，现实中的**主主复制**架构，我们一般采用的是Active-Passive模式而不是Active-Active模式。
- 对于判断主从是否一致的问题，目前官方并没有一个成熟的解决方案，可以利用第三方的工具 pt-table-checksum 进行判断。





### 主从复制



对于未上线的主机，即在主库没有任何写入的情况下，可以采用如下方式配置主从：

1. 在主从主机上部署好 MySQL，并**在主库上启用二进制日志**，注意主从 server-id 必须不一样，server-id 的设置可以使用 IP 的后 8 位加上端口（port）等其他标识信息，主库的配置文件类似如下：

   ```ini
   [mysqld]
   log-bin=mysql-bin
   server-id=1
   ```

2. 记录主库的日志文件名 File 和日志文件 Position，命令如下：

   ```sql
   mysql> show master status;
   +---------------+----------+--------------+------------------+-------------------+
   | File          | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
   +---------------+----------+--------------+------------------+-------------------+
   | binlog.000002 |  2635757 |              |                  |                   |
   +---------------+----------+--------------+------------------+-------------------+
   1 row in set (0.01 sec)
   ```

3. 在主库中创建复制账号，允许从库来访问，命令如下：

   ```sql
   # 创建用户
   mysql> CREATE USER 'replic_user' IDENTIFIED WITH mysql_native_password BY 'replic_user_pwd';
   Query OK, 0 rows affected (0.05 sec)
   
   # 授予权限
   # ref: https://dev.mysql.com/doc/refman/8.0/en/grant.html
   # 如果账户仅用于复制，那么 replication slave 的权限就足够了
   # 但在本地查看从库（slave server）信息，还需要 replication client 权限。
   mysql> GRANT replication slave, replication client ON *.* to 'replic_user';
   Query OK, 0 rows affected (0.02 sec)
   
   # 查看权限
   mysql> SHOW GRANTS FOR 'replic_user';
   +-------------------------------------------------------------------------+
   | Grants for replic_user@%                                                |
   +-------------------------------------------------------------------------+
   | GRANT REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO `replic_user`@`%` |
   +-------------------------------------------------------------------------+
   1 row in set (0.01 sec)
   
   # 查看进程命令
   mysql> SHOW PROCESSLIST;
   ```

4. 从库编辑配置文件，示例如下：

   ```ini
   # 建议主从配置一样的名字，不然在以后的配置中，处理问题会复杂很多
   log_bin = mysql-bin
   
   # 只有server-id必须设置，其他选项是可选的
   server_id = 2
   relay_log = /path_to_mysql_log/mysql-relay-bin
   
   # log_slave_updates 决定了是否将从主库接收的更新写入从库自身的二进制日志里
   # 将这个值设置为1，是方便以后以将这个从库提升为主库后，根据需要再配置一个从库，也方便数据恢复。
   log_slave_updates = 1
   
   # 设置了read_only=1之后，将只有 SUPER 权限的用户才可以修改数据
   read_only = 1
   ```

5. 从库执行如下语句，其中 MASTER_LOG_FILE 和 MASTER_LOG_POS 是第二个步骤记录的值：

   ```sql
   # 查看进程命令
   mysql> SHOW PROCESSLIST;
   
   mysql> CHANGE MASTER TO
     MASTER_HOST='127.0.0.1',
     MASTER_PORT=3306,
     MASTER_USER='replic_user',
     MASTER_PASSWORD='replic_user_pwd',
     MASTER_LOG_FILE='binlog.000002',
     MASTER_LOG_POS=2635757;
   
   Query OK, 0 rows affected (0.12 sec)
   ```

6. 从库执行如下语句，启动 slave：

   ```sql
   mysql> START SLAVE;
   
   Query OK, 0 rows affected (0.07 sec)
   
   # 确认执行正常：前两项应该都是Yes。Seconds_Behind_Master 应该不是NULL
   mysql> SHOW SLAVE STATUS \G;
   
   # 停止从库复制
   mysql> STOP SLAVE;
   ```

   



## 一些系统知识



### 操作系统



#### 进程



**进程**可以简单地理解为程序加数据，程序本身只是指令、数据及其组织形式的描述，**进程才是程序（那些指令和数据）的真正运行实例**。

若干进程都有可能与同一个程序有关系，且每个进程都可以用同步（循序）或异步（平行）的方式独立运行。用户下达运行程序的命令之后，就会产生进程。

同一程序可以产生多个进程（一对多的关系），以允许同时有多位用户运行同一程序，却不会发生冲突。

进程在运行时，状态会发生改变，如新生、运行、等待、就绪、结束等，各状态的名称也可能会随着操作系统的不同而不同。



#### 线程



**线程是操作系统能够进行运算调度的最小单位。它被包含在进程之中，是进程中的实际运作单位。**

一个进程可以有许多线程，每条线程并行执行不同的任务。

使用**多线程技术**（多线程即每一个线程都代表一个进程内的一个独立执行的控制流）的操作系统或计算机架构，同一个程序的平行线程，可在多CPU主机或网络上真正做到同时运行（在不同的CPU上）。**多线程技术可以让一个进程充分利用多个CPU**。

**同一进程中的多条线程将会共享该进程中的全部系统资源**，如虚拟地址空间、文件描述符和信号处理等。

但同一进程中的多个线程也都有各自的调用栈（call stack）、寄存器环境（register context）和线程本地存储（thread local storage）。

**在多核或多CPU上使用多线程程序设计的好处是显而易见的，即提高了程序的执行吞吐率**。



#### 内核调度



**内核调度**将把CPU的运行时间分成许多片，然后安排给各个进程轮流运行，使得所有进程仿佛在同时运行。

内核需要决定运行哪个进程/线程，哪个需要等待，选择要在哪个CPU核上运行线程。

**内核运行于一个特殊的CPU态，内核态，拥有完全的权限访问设备**，内核将仲裁对设备的访问，以支持多任务，避免用户进程访问彼此的空间而破坏数据，除非显式被允许访问。

用户程序一般运行在用户态，它们通过系统调用的方式执行一些限制权限的操作，例如I/O操作。



#### 文件系统



**文件系统**是一种向用户提供底层数据访问的机制。它将设备中的空间划分为特定大小的块（扇区），一般每块有512B。数据存储在这些块中，由文件系统软件来负责将这些块组织为文件和目录，并记录哪些块被分配给了哪个文件，以及哪些块没有被使用。

**文件系统使用缓存来提升读性能，使用缓冲来提升写性能。**在我们调整操作系统和数据库的时候，要注意批量写入数据的冲击，一些系统会缓冲写数据几十秒，然后合并刷新到磁盘中，这将表现为时不时的I/O冲击。

mmap 的方式有助于我们减少一些系统调用，但对于提升整体性能/吞吐的贡献将会很少。因为主要的瓶颈，主要花费的时间是在I/O上。许多NoSQL的数据库使用了 mmap 的方式来持久化数据，在I/O写入量大的时候，其性能急剧下降就是这个道理。



#### I/O



- 逻辑I/O：可以理解为是应用发送给文件系统的I/O指令。

- 物理I/O：可以理解为是文件系统发送给磁盘设备的I/O指令。

- 磁盘IOPS：每秒的输入输出量（或读写次数），是衡量磁盘性能的主要指标之一。

  IOPS是指单位时间内系统能处理的I/O请求数量，一般以每秒处理的I/O请求数量为单位，I/O请求通常为读或写数据操作的请求。OLTP应用更看重IOPS。

- 磁盘吞吐：指单位时间内可以成功传输的数据数量。OLAP应用更看重磁盘吞吐。





## 一些优化知识



### 静态内容、动态内容



首先要分离静态内容和动态内容，分离了静态内容和动态内容之后，我们才可以分别进行优化，选择更适合的应用服务器，比如Nginx更适合静态文件，而Apache相对来说更适合动态内容。



#### 静态内容

某些静态文件还可以压缩传输。完全静态化是不现实的，往往需要通过模板的方式，我们有必要了解我们所维护的项目的静态化策略。不同的应用服务器适合处理不同的内容，尤其对于海量流量的应用，用更合适的产品来处理特定的内容，会更有规模效应。

静态内容优化的主要的技术是**CDN技术**，**CDN 的目的是将网站的内容发布到最接近用户的网络位置，使用户可以就近取得所需的内容**。



#### 动态内容

动态内容优化的一些方法和指引规则具体如下：

- **计算复用**：计算复用指的是，通过一些编程技巧，可以重复利用之前的计算结果，加快执行效率。计算复用并不适合应用于复杂的算法操作，在日常的许多编程中，都可能碰到，如果有一些操作频繁的执行，又和上下文无关，那么可能是需要考虑计算复用的。
- **使用缓存**：缓存系统缓存了程序处理的结果，它可以减少对后端的调用。
- **同样的内容不要产生两次**：因为数据是可以被缓存的，无论缓存在服务器还是客户端，我们都不需要重复产生相同的内容，因为这样会浪费系统资源。
- **仅在数据发生改变时，重新生成内容**：有时我们想生成一些静态文件，提高访问效率，相对于重新生成所有的文件，仅重新生成数据发生了改变的页面，是成本更低的方式。
- 将系统切割为更小的组件，**分离频繁变更的部分和不经常变动的部分**。
- **减少对数据库的调用**：相对于应用服务器，数据库的可扩展性更低，减少对数据库的调用，可以让数据库没那么可能成为整个系统的瓶颈所在。
- 对于缓存产品，如Memcached，需要**留意缓存策略**，比如，超时的设置或设置得过小，会导致数据库的压力。更有效率的做法是，在数据内容发生改变的时候，才通知缓存失效。



### 网络优化



一些网络相关的注意事项，具体如下：

- 我们需要了解数据流，清楚我们的网络架构，这样有助于我们进行分析，在哪些环节可能存在网络问题，哪些环节可以优化。

  比如用户最开始发起访问，一般要有DNS查询的环节，那么我们是否可以让用户选择最近的DNS服务器呢？我们是否可以调度用户访问最近机房的服务器呢？我们是否需要配置一个反向代理来加速用户访问呢？

- **应用服务器处出现网络瓶颈的可能性远大于数据库**，数据库一般网络流量很小。

- 现实中，优化网络的行为很少，这个主要是因为绝大部分项目在还远远没有到达网络瓶颈的时候就暴露出架构的问题了。

- **跨IDC的网络质量不能和内网质量相比**，对于跨IDC的网络，两个节点之间来回往往需要几十毫秒，节点之间的各种设备（路由器、交换机等）都可能影响到网络质量，运维比研发人员要更加意识到跨IDC网络质量对于整体系统的影响。



### 解耦



解耦是确保可扩展的架构的最重要的技术之一。许多知名的网站和服务，采取的都是一种松散耦合的服务导向的模型，比如Twitter、Amazon等。这种松散耦合的服务，可以尽快发布新特性。小型的团队可以自己制定决策，发布面向用户的变更，而不依赖于其他团队。



#### 异步

**有些操作并不需要要马上去做，而是可以延迟到以后再做**，因为这并不会影响用户的体验。

“异步”的字面意思可能会导致混淆，“异步”并不是说一定要把工作推迟到以后去完成（尽管这可能会发生），异步技术一般使用了队列，实际上队列往往不会被积压，它们会处理得很快，它的本质目的是为了解耦，因为有些操作并不需要等待另外一些操作，可以“异步”地、并发地进行。



#### 把业务逻辑分解为更小的部分

即分而治之，隔离那些可以异步操作的部分。

通过把系统分解为更小的部分，我们可以做到如下几点：

- 简化问题：原来一个复杂的逻辑，我们可以将其分解为一些更简单的问题。
- 故障隔离：针对更小的系统，我们可以针对性地设计处理策略，某个子系统的故障不会影响到其他的子系统，其他子系统仍然可以正常地运行。
- 分解方法、策略和实现：这个比较好理解，分解为更小的部分，复杂的方法、策略和实现就变成了更小的问题。
- 简化设计：把复杂的问题分解为简单的问题，那么设计也会变得相对简单得多了。
- 更好地建立性能模型：因为能够更准确地衡量影响性能的因素，从而可以简化容量规划。容量规划其实不是一件容易的事情，你首先得有一个性能模型，如果影响性能的因素有很多，那么你这个性能模型会很复杂，难以建立，或者不太准确；现在我们分解了问题，因此我们可以建立一系列简单的模型，然后就可以综合这些简单的性能模型得到我们最终的性能模型。



#### 使用消息队列

这个和上面所说的异步，是结合在一起的，利用消息队列可以很好地异步处理数据传送和存储，我们把需要完成的工作的信息用队列进行传送，这样就可以实现异步幕后处理队列了。

也就是说，**我不想现在就做某件事情，而是告诉其他人去做这件事情，这样可以加快我做事的效率**。这也是我们上面所说的异步。

互联网应用大量地使用了消息队列。**消息队列不仅被用于系统内部组件之间的通信，同时也被用于系统跟其他服务之间的交互。当你频繁地向数据库中插入数据、频繁地向搜索引擎提交数据时，就可以采取消息队列来异步插入。**另外，还可以将较慢的处理逻辑、有并发数量限制的处理逻辑，通过消息队列放在后台进行处理，例如FLV视频转换、发送手机短信、发送电子邮件等。

消息队列的使用可以**增加系统的可扩展性、灵活性和用户体验**。非基于消息队列的系统，它的运行速度将取决于系统中最慢的组件的速度（也就是短板效应）。而基于消息队列，可以将系统中的各个组件解除耦合，这样系统就不再受到最慢组件的束缚，各组件之间可以异步运行，从而可以以更快的速度完成各自的工作。除此之外消息队列还可以抑制性能波峰的产生，在瞬时业务高峰产生时可保持性能曲线的平滑。



## NoSQL 产品



常见的 NoSQL 产品的存储引擎有两类实现。一种是 **Memory-Mapped 存储引擎**，另一种是**日志型的存储模型**。



许多 NoSQL 产品都采用了 Memory-Mapped 存储引擎，如 Tokyo Tyrant、BDB、MongoDB 等，MMAP方式是靠操作系统将数据刷新到磁盘的，用的是操作系统的虚拟内存管理策略。在某些场合可以提高吞吐率，毕竟写内存比写磁盘要快。

主要弊端是数据库无法控制数据写入磁盘的顺序，这样就不可能使用预写日志（Write-ahead logging）来保障持久性。发生崩溃的情况下，数据文件可能被破坏，需要进行修复。



而日志型的存储模型，数据文件是顺序添加的，如 bigtable、couchdb。其他如 HBASE、leveldb 也是类似的实现。

这种存储实现，可以保证在系统掉电后，数据文件尽量不被破坏，需要考虑的是灾难恢复后如何进行恢复，且不丢失数据。

目前许多公司都是基于Google的bigtable模型来设计的，既保持了单机的持久性，又有优良的伸缩性。



目前 Redis 的实现，有些特别，**主流的快照持久化方式，是把内存中的数据定期 dump 到磁盘上（先 dump 到临时文件，然后mv，可以保证整个过程是原子性的安全操作）**，对于实例崩溃，电源掉电之类的故障，也能表现良好，只是会有数据丢失。

Redis 另有一种 **AOF 的方式，通过回放日志来进行灾难恢复**，它可以尽量减少数据丢失，但由于I/O资源消耗比较大，因此用的并不是很多。



## 案例



### 树状结构表设计



#### 路径枚举法



```sql
mysql> CREATE DATABASE IF NOT EXISTS study CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
Query OK, 1 row affected (0.04 sec)

mysql> USE study;
Database changed

mysql> CREATE TABLE IF NOT EXISTS `comment`(
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `parent_id` int(11) NOT NULL DEFAULT 0 COMMENT '上级ID',
    `path` varchar(64) NOT NULL DEFAULT '' COMMENT '该节点的所有祖先信息，使用反斜线分割',
    `comment` varchar(255) NOT NULL DEFAULT '' COMMENT '评论内容'
) COMMENT '评论表' ENGINE InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
Query OK, 0 rows affected (0.07 sec)

# 插入一些数据
mysql> INSERT INTO `comment` (`id`, `parent_id`, `path`, `comment`) VALUES (1, 0, '1/', '这本书不错');
INSERT INTO `comment` (`id`, `parent_id`, `path`, `comment`) VALUES (2, 1, '1/2', '此书作者和译者的视野颇为广阔，在思路上更加大胆');
INSERT INTO `comment` (`id`, `parent_id`, `path`, `comment`) VALUES (3, 1, '1/3', '我在犹豫要不要买');
INSERT INTO `comment` (`id`, `parent_id`, `path`, `comment`) VALUES (4, 2, '1/2/4', '说的有道理');
INSERT INTO `comment` (`id`, `parent_id`, `path`, `comment`) VALUES (5, 3, '1/3/5', '值得购买，内容比较契合目前的数据发展潮流');
INSERT INTO `comment` (`id`, `parent_id`, `path`, `comment`) VALUES (6, 5, '1/3/5/6', '封面和纸张设计略显粗糙');
INSERT INTO `comment` (`id`, `parent_id`, `path`, `comment`) VALUES (7, 0, '7/', '在当下大数据时代，这本书一定要看');
INSERT INTO `comment` (`id`, `parent_id`, `path`, `comment`) VALUES (8, 3, '3/8', '该书气味之大，装帧之差实属罕见');
INSERT INTO `comment` (`id`, `parent_id`, `path`, `comment`) VALUES (9, 7, '7/9', '这本书必须要看');
INSERT INTO `comment` (`id`, `parent_id`, `path`, `comment`) VALUES (10, 7, '7/10', '实践性较强');

# 获取指定 comment 的所有上级ID
# https://www.cnblogs.com/chenjiacheng/p/6522211.html
mysql> DELIMITER //
-- 删除原有函数
DROP FUNCTION IF EXISTS getAllParentComments;
-- 定义函数
CREATE DEFINER=`root`@`%` FUNCTION `getAllParentComments`(currentId INT) RETURNS varchar(64) CHARSET utf8mb4 COLLATE utf8mb4_general_ci
    READS SQL DATA
BEGIN
  -- 声明局部变量：局部变量无法返回
  -- DECLARE path VARCHAR(64) DEFAULT '';
  -- 声明全局变量
  SET @path = '';
  
  -- 修改变量值
  -- 获取当前 comment 的 path
  SET @path = (SELECT `path` FROM `comment` WHERE `id` = currentId);
  -- 去掉最后一个ID（即当前ID）
  SET @path = LEFT(@path, LENGTH(@path) - LENGTH(currentId) - 1);
  
  RETURN @path;
END //
-- 定义结束
DELIMITER ;

Query OK, 0 rows affected (0.03 sec)
 
Query OK, 0 rows affected (0.03 sec)

# 调用函数——与调用自带函数一致
mysql> SELECT getAllParentComments(4) as parent;
+--------+
| parent |
+--------+
| 1/2    |
+--------+
1 row in set (0.01 sec)


# 如果要查找某个节点的所有后代，例如查找comment_id等于3的所有后代，可以使用如下的查询语句：
mysql> SELECT * FROM `comment` WHERE path LIKE '1/3/_%';
+----+-----------+---------+--------------------------------------------------------------+
| id | parent_id | path    | comment                                                      |
+----+-----------+---------+--------------------------------------------------------------+
|  5 |         3 | 1/3/5   | 值得购买，内容比较契合目前的数据发展潮流 |
|  6 |         5 | 1/3/5/6 | 封面和纸张设计略显粗糙                            |
+----+-----------+---------+--------------------------------------------------------------+
2 rows in set (0.01 sec)



# 如果要查找下一层子节点，可以使用如下的查询语句
# 请根据数据特点编写正则表达式
mysql> SELECT * FROM `comment` WHERE path REGEXP '^1/3/[0-9]+[/]?$';
+----+-----------+-------+--------------------------------------------------------------+
| id | parent_id | path  | comment                                                      |
+----+-----------+-------+--------------------------------------------------------------+
|  5 |         3 | 1/3/5 | 值得购买，内容比较契合目前的数据发展潮流 |
+----+-----------+-------+--------------------------------------------------------------+
1 row in set (0.01 sec)

# 插入操作也比较简单，只需要复制一份父节点的路径，并将新节点的ID值（comment_id）添加到路径末尾就可以了。

# 枚举路径的方式使得查询子树和祖先都变得更加简单，查看分隔符即可知道节点的层次，
# 虽然冗余存储了一些数据，应用程序需要额外增加代码以确保路径信息的正确性，
# 但这种设计的扩展性更好，更能适应未来数据的不断增长
```



> #### 思考
>
> 如果需要变更父节点，则需要变动哪些部分？
>
> 1. 变更节点 c 的 path，替换为新父节点 P 的 path + c 的id
> 2. 变更节点 c 的所有子节点的 path



#### 闭包表



闭包表也是一种通用的方案，它需要额外增加一张表，用于记录节点之间的关系。它不仅记录了节点之间的父子关系，也记录了树中所有节点之间的关系。其优势是**在一颗树中快速查找到子孙节点、祖先节点**。



```sql
# 设计闭包表
mysql> CREATE TABLE `node_relation` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT '自增ID',
  `ancestor` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '祖先节点',
  `descendant` int(10) unsigned NOT NULL DEFAULT '0' COMMENT '后代节点',
  `distance` tinyint(3) unsigned NOT NULL DEFAULT '0' COMMENT '相隔层级，>=1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_anc_desc` (`ancestor`,`descendant`),
  KEY `idx_desc` (`descendant`)
) COMMENT '节点关系表 - 闭包表' ENGINE InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

Query OK, 0 rows affected (0.09 sec)

# 由于闭包表新增了节点和节点之间的关系，所以在变更树结构的时候，会重构这个关系，想想就觉得复杂。
# 所以数据量少，请谨用闭包表。


# 插入数据
# 该数据为一个 1->2->3 的二叉树结构
mysql> INSERT INTO `node_relation` (`ancestor`, `descendant`, `distance`) VALUES (1, 2, 1);
INSERT INTO `node_relation` (`ancestor`, `descendant`, `distance`) VALUES (1, 3, 1);
INSERT INTO `node_relation` (`ancestor`, `descendant`, `distance`) VALUES (1, 4, 2);
INSERT INTO `node_relation` (`ancestor`, `descendant`, `distance`) VALUES (1, 5, 2);
INSERT INTO `node_relation` (`ancestor`, `descendant`, `distance`) VALUES (1, 6, 2);
INSERT INTO `node_relation` (`ancestor`, `descendant`, `distance`) VALUES (2, 4, 1);
INSERT INTO `node_relation` (`ancestor`, `descendant`, `distance`) VALUES (2, 5, 1);
INSERT INTO `node_relation` (`ancestor`, `descendant`, `distance`) VALUES (3, 6, 1);


# 常用操作
# 查询 ancestor 为 1 的所有子集
mysql> SELECT `descendant` FROM `node_relation` WHERE `ancestor` = 1;
+------------+
| descendant |
+------------+
|          2 |
|          3 |
|          4 |
|          5 |
|          6 |
+------------+
5 rows in set (0.00 sec)

# 查询 ancestor 为 5 的所有祖先节点
mysql> SELECT `ancestor` FROM `node_relation` WHERE `descendant` = 5;
+----------+
| ancestor |
+----------+
|        1 |
|        2 |
+----------+
2 rows in set (0.01 sec)
```



但是闭包表在做**增**和**移动**操作时，会变得很复杂。



##### 增

```sql
# 增
# 1. 新增直接节点记录
mysql> INSERT INTO `node_relation` (`ancestor`, `descendant`, `distance`) VALUES (6, 7, 1);
Query OK, 1 row affected (0.02 sec)
# 2. 记录闭包关系（新增节点与其他节点——直接节点的相关节点的关系）
mysql> SELECT `ancestor`,`distance` FROM `node_relation` WHERE `descendant` = 6;
+----------+----------+
| ancestor | distance |
+----------+----------+
|        1 |        2 |
|        3 |        1 |
+----------+----------+
2 rows in set (0.01 sec)
# 3. 新增间接节点记录（根据 2 的结果，建议使用程序而不是 SQL
# 节点距离应 + 1
mysql> INSERT INTO `node_relation` (`ancestor`, `descendant`, `distance`) VALUES (1, 7, 3);
INSERT INTO `node_relation` (`ancestor`, `descendant`, `distance`) VALUES (3, 7, 2);

Query OK, 1 row affected (0.02 sec)
Query OK, 1 row affected (0.02 sec)
```



##### 删

```sql
# 删：删除节点及节点相关的间接节点
# 即删除节点之间的关系即可
mysql> DELETE FROM `node_relation` WHERE `ancestor` = 3 OR `descendant` = 3;
```



##### 移动

```sql
# 移动：即变更父节点
# 这里假设：变更节点 C 为 2，其旧父节点 O 为 1，其子孙节点包括：4、5，新父节点 P 为 3
# 查询 旧父节点O 与变更节点 C 及其子孙节点 的所有关系
mysql> SELECT `ancestor`, `descendant`, `distance` FROM `node_relation` WHERE `ancestor` = 2 OR `descendant` = 2;
+----------+------------+----------+
| ancestor | descendant | distance |
+----------+------------+----------+
|        1 |          2 |        1 |
|        2 |          4 |        1 |
|        2 |          5 |        1 |
+----------+------------+----------+
3 rows in set (0.01 sec)

# 重建新关系
# 新关系为：变更节点 C 子树（包括 C） x 新父节点 P 组树（包括 P）的笛卡尔积
mysql> SELECT `ancestor`, `descendant`, `distance` FROM `node_relation` WHERE `ancestor` = 2 OR `descendant` = 3;
+----------+------------+----------+
| ancestor | descendant | distance |
+----------+------------+----------+
|        1 |          3 |        1 |
|        2 |          4 |        1 |
|        2 |          5 |        1 |
+----------+------------+----------+
3 rows in set (0.01 sec)
# 新关系
mysql> SELECT `ancestor`,`descendant`,`distance`,'P' AS `level` FROM `node_relation` WHERE `descendant` = 3
UNION ALL
SELECT `ancestor`,`descendant`,`distance`,'C' AS `level` FROM `node_relation` WHERE `ancestor` = 2;
+----------+------------+----------+-------+
| ancestor | descendant | distance | level |
+----------+------------+----------+-------+
|        1 |          3 |        1 | P     |
|        2 |          4 |        1 | C     |
|        2 |          5 |        1 | C     |
+----------+------------+----------+-------+
3 rows in set (0.01 sec)

# 或者使用 CASE……[WHEN……THEN……]ELSE……END 结构
mysql> SELECT `ancestor`,`descendant`,`distance`,
CASE `descendant` WHEN 3 THEN 'P' ELSE 'C' END AS `level` 
FROM `node_relation` WHERE `ancestor` = 2 OR `descendant` = 3;

+----------+------------+----------+-------+
| ancestor | descendant | distance | level |
+----------+------------+----------+-------+
|        1 |          3 |        1 | P     |
|        2 |          4 |        1 | C     |
|        2 |          5 |        1 | C     |
+----------+------------+----------+-------+
3 rows in set (0.01 sec)
# -----------------------难点：计算 P 和 C 之间的笛卡尔积-----------------------

# 由于这里只有两层结构（父子），可以使用嵌套循环
DELIMITER //
DROP PROCEDURE IF EXISTS caculateCartesianProduct;

CREATE PROCEDURE caculateCartesianProduct(INOUT cId int(11), INOUT pId int(11))
BEGIN
    DECLARE cursorParent CURSOR FOR SELECT `ancestor` FROM `node_relation` WHERE `descendant` = pId;
    DECLARE cursorChild CURSOR FOR SELECT `descendant` FROM `node_relation` WHERE `ancestor` = cId;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET finished = 1;
    
    # 打开游标
    OPEN cursorParent;
    # 检索光标
      FETCH cursorParent INTO parent;
      
      
    # 关闭游标
    CLOSE cursorParent;
END //

DELIMITER ;

# -----------------------预期结果-----------------------

+----------+------------+----------+
| ancestor | descendant | distance |
+----------+------------+----------+
|        1 |          2 |        2 |
|        1 |          4 |        3 |
|        1 |          5 |        3 |
|        3 |          2 |        1 |
|        3 |          4 |        2 |
|        3 |          5 |        2 |
+----------+------------+----------+

# -----------------------难点：计算 P 和 C 之间的笛卡尔积-----------------------

# 删除 旧父节点O 与变更节点 C 的关系
mysql> DELETE FROM `node_relation` WHERE `descendant` = 2 AND `ancestor` = 1;
Query OK, 1 rows affected (0.03 sec)

# 新关系走「增」步骤
mysql> INSERT INTO `node_relation` (`ancestor`, `descendant`, `distance`) VALUES (3, 2, 1);

```





### 获取当前节点的所有子节点

```sql
# 有点问题：当子节点的 pid 大于父节点时，该子节点的子节点将查不出来
SELECT  id, parent_id
FROM    (SELECT * FROM `company`
            ORDER BY `parent_id`, `id`) AS targetTable,
        (SELECT @pv := ?) AS initialisation
WHERE   FIND_IN_SET(targetTable.`pid`, @pv) > 0 AND @pv := CONCAT(@pv, ',', targetTable.`id`);


# MySQL 8 实现
WITH RECURSIVE `target` AS(
    SELECT parent.id, parent.pid,parent.title FROM auth_group `parent` WHERE parent.id = ?
    UNION ALL
    SELECT child.id, child.pid,child.title FROM auth_group `child` INNER JOIN `target` ON target.id = child.pid
) SELECT id,title,pid FROM target;
```



### 获取当前节点的所有上级节点

```sql
SELECT @r AS _id,
    (SELECT @r := parent_id FROM company WHERE id = _id) AS pid,
    @l := @l + 1 AS level
FROM (SELECT @r := ?, @l := 0) AS vars, company
WHERE @r <> 0 AND parent_id > 0 ORDER BY level;
```



### 删除重复记录，并保留ID最小的记录

```sql
# 参考 leetcode 第 196 题
# 使用「自连接」，从 P1 表中删除符合 where 条件的记录

# 查询
select *
from Person p1, Person p2
where p1.email = p2.email and p1.id > p2.id;

# 删除
delete p1 
from Person p1, Person p2
where p1.email = p2.email and p1.id > p2.id;
```

另一个使用了 MySQL 8.0 的窗口函数（开窗函数？），如下：

> 作者：hbw0010
> 链接：https://leetcode.cn/problems/delete-duplicate-emails/solution/kai-chuang-han-shu-jie-fa-by-hbw0010-zpmt/
> 来源：力扣（LeetCode）
> 著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。

```sql
delete 
from Person
where Id in
    (
        select Id
        from
            (
                select Id,
                    row_number() over(partition by Email order by Id) rn
                from Person
            ) t1
        where rn>1
    );
```

窗口函数涉及代码`row_number() over(partition by Email order by Id) rn`，具体要等以后再研究了。



### 按条件更新值

> [Leetcode #627 变更性别](https://leetcode.cn/problems/swap-salary/)

```sql
# case ... when ... then ... end 形式
update Salary set sex = 
    case sex
        when 'Female' then 'Male'
        when 'Male' then 'Female'
    end;
    
# if() 函数，类似 PHP 中的 ?: 三元操作符
update Salary set sex = if(sex='Female', 'Male', 'Female');
```



### 行转列问题



> [Leetcode #1179 重新格式化部门表](https://leetcode.cn/problems/reformat-department-table/)



```sql
SELECT id, 
    SUM(CASE WHEN month='Jan' THEN revenue END) AS Jan_Revenue,
    SUM(CASE WHEN month='Feb' THEN revenue END) AS Feb_Revenue,
    SUM(CASE WHEN month='Mar' THEN revenue END) AS Mar_Revenue,
    SUM(CASE WHEN month='Apr' THEN revenue END) AS Apr_Revenue,
    SUM(CASE WHEN month='May' THEN revenue END) AS May_Revenue,
    SUM(CASE WHEN month='Jun' THEN revenue END) AS Jun_Revenue,
    SUM(CASE WHEN month='Jul' THEN revenue END) AS Jul_Revenue,
    SUM(CASE WHEN month='Aug' THEN revenue END) AS Aug_Revenue,
    SUM(CASE WHEN month='Sep' THEN revenue END) AS Sep_Revenue,
    SUM(CASE WHEN month='Oct' THEN revenue END) AS Oct_Revenue,
    SUM(CASE WHEN month='Nov' THEN revenue END) AS Nov_Revenue,
    SUM(CASE WHEN month='Dec' THEN revenue END) AS Dec_Revenue
FROM department
GROUP BY id
ORDER BY id;


# 这里使用 case ... when ... then ... end 结构来获取符合条件的结果
# 换成 if() 函数也可
# 最后对结果使用聚合函数 sum() 来统计
SELECT id, 
    SUM(IF(month='Jan', revenue, NULL)) AS Jan_Revenue,
    SUM(IF(month='Feb', revenue, NULL)) AS Feb_Revenue,
    SUM(IF(month='Mar', revenue, NULL)) AS Mar_Revenue,
    SUM(IF(month='Apr', revenue, NULL)) AS Apr_Revenue,
    SUM(IF(month='May', revenue, NULL)) AS May_Revenue,
    SUM(IF(month='Jun', revenue, NULL)) AS Jun_Revenue,
    SUM(IF(month='Jul', revenue, NULL)) AS Jul_Revenue,
    SUM(IF(month='Aug', revenue, NULL)) AS Aug_Revenue,
    SUM(IF(month='Sep', revenue, NULL)) AS Sep_Revenue,
    SUM(IF(month='Oct', revenue, NULL)) AS Oct_Revenue,
    SUM(IF(month='Nov', revenue, NULL)) AS Nov_Revenue,
    SUM(IF(month='Dec', revenue, NULL)) AS Dec_Revenue
FROM department
GROUP BY id
ORDER BY id;
```





### 列转行问题



相关问题：[#1795 每个产品在不同商店的价格](https://leetcode.cn/problems/rearrange-products-table/)



主要是运用 union 表连结来实现。示例代码如下：



```sql
SELECT product_id, 'store1' store, store1 price FROM Products WHERE store1 IS NOT NULL
UNION ALL
SELECT product_id, 'store2' store, store2 price FROM Products WHERE store2 IS NOT NULL
UNION ALL
SELECT product_id, 'store3' store, store3 price FROM Products WHERE store3 IS NOT NULL;

# 不考虑去重时，尽量使用 UNION ALL（UNION 将产生去重开销）
```





### 左联接 NULL 值处理问题



在浏览 Leetcode [#1407](https://leetcode.cn/problems/top-travellers/) 问题时，用到 `left join`，然后出现 右表中不存在左表的相关记录时，左表对应记录将表现为 NULL，如果对数据有所要求，则可以（同时也应该）使用`ifnull()`函数进行处理。



### group_concat() 函数



相关问题：[#1484](https://leetcode.cn/problems/group-sold-products-by-the-date/)

主要是对**同一列的多个结果**进行组合，[官方文档](https://dev.mysql.com/doc/refman/8.0/en/aggregate-functions.html#function_group-concat)解释如下：

```sql
GROUP_CONCAT([DISTINCT] expr [,expr ...]
             [ORDER BY {unsigned_integer | col_name | expr}
                 [ASC | DESC] [,col_name ...]]
             [SEPARATOR str_val])
```

示例用法：

```sql
SELECT a.sell_date, 
    count(distinct a.product) as num_sold, 
    group_concat(distinct product order by product SEPARATOR ',') as products
FROM Activities a
GROUP BY a.sell_date
ORDER BY a.sell_date;
```



### find_in_set() 函数

针对使用了固定分隔符的字符串，查找其中某个值是否存在。官方文档：[find_in_set](https://dev.mysql.com/doc/refman/8.0/en/string-functions.html#function_find-in-set)。

示例用法：

```sql
# 隐含条件：'conditions' （疾病）包含 0 个或以上的疾病代码，以空格分隔
# conditions 需要做处理

SELECT patient_id,patient_name,conditions
FROM Patients
WHERE FIND_IN_SET('DIAB1', REPLACE(conditions, ' ', ',')) <> 0;
```



### 更好理解 group by



参考 Leetcode [#1693](https://leetcode.cn/problems/daily-leads-and-partners/)，示例代码：

```sql
SELECT date_id,make_name,COUNT(DISTINCT lead_id) AS unique_leads, COUNT(DISTINCT partner_id) AS unique_partners
FROM DailySales
GROUP BY date_id,make_name;
```



### 窗口函数 - 关于排行的问题



参考 Leetcode [#176 第二高的薪水](https://leetcode.cn/problems/second-highest-salary/)，示例代码：



```sql
SELECT (
    SELECT DISTINCT salary
    FROM (
        SELECT DENSE_RANK() OVER w AS `rank`, e.*
        FROM Employee e
        WINDOW w AS (ORDER BY salary DESC)
    ) r
    WHERE r.rank = 2
) AS SecondHighestSalary;
```



该解法使用了窗口函数`dense_rank()`，[官方文档](https://dev.mysql.com/doc/refman/8.0/en/window-function-descriptions.html#function_rank) 给出了以下示例：

```sql
SELECT
    val,
    ROW_NUMBER() OVER w AS 'row_number',
    RANK()       OVER w AS 'rank',
    DENSE_RANK() OVER w AS 'dense_rank'
FROM numbers
WINDOW w AS (ORDER BY val);

# 也可以将 window 部分同窗口函数放一起，如下，但是会多出几个排序：
SELECT
    val,
    ROW_NUMBER() OVER (ORDER BY val) AS 'row_number',
    RANK()       OVER (ORDER BY val) AS 'rank',
    DENSE_RANK() OVER (ORDER BY val) AS 'dense_rank'
FROM numbers;

# rank() 函数：同值同排名，排名不连续
# dense_rank() 函数：同值同排名，排名连续
```



类似题 [#177 第N高的薪水](https://leetcode.cn/problems/nth-highest-salary/)，做了一个函数，如下：

```sql
CREATE FUNCTION getNthHighestSalary(N INT) RETURNS INT
BEGIN
  RETURN (
      # Write your MySQL query statement below.
      SELECT (
        SELECT DISTINCT salary
        FROM (
            SELECT DENSE_RANK() OVER w AS `rank`, e.*
            FROM Employee e
            WINDOW w AS (ORDER BY salary DESC)
        ) r
        WHERE r.rank = N
      ) AS NHighestSalary
  );
END
```



进阶题[#184 部门工资最高的员工](https://leetcode.cn/problems/department-highest-salary/)，多了一个分类最高，所以这里在 OVER 部分用到了`PARTITION BY`子句，用于指示如何对行分组，具体说明请[查阅](https://dev.mysql.com/doc/refman/8.0/en/window-functions-usage.html)。示例代码如下：



```sql
SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary
FROM (
    SELECT dense_rank() OVER (PARTITION BY e.departmentId ORDER BY salary desc) AS `rank`, e.* 
    FROM Employee e
) e LEFT JOIN Department d ON e.departmentId = d.id
WHERE e.`rank` = 1;
```





### 窗口函数 - LEAD()



参考 Leetcode [#180 连续出现的数字](https://leetcode.cn/problems/consecutive-numbers/)。示例代码如下：



```sql
# 请注意 lead 可能是关键字

SELECT DISTINCT q.num AS ConsecutiveNums
FROM (
    SELECT num,
        LEAD(num) over w AS `lead`,
        LAG(num) over w AS `lag`
    FROM Logs
    WINDOW w AS (ORDER BY id)
) q
WHERE q.lead = q.num AND q.lag = q.num;
```



具体请参考 [MySQL 文档](https://dev.mysql.com/doc/refman/8.0/en/window-function-descriptions.html#function_lag)，主要是计算**行与行之间的差异**。`LAG()`函数方法定义如下：

```sql
 LAG(expr [, N = 1[, default = NULL]]) [ null_treatment] over_clause
 
 expr 为字段或表达式；
 N 为前第 N 行（LEAD() 中为后第 N 行）；
 default 为默认值
```


