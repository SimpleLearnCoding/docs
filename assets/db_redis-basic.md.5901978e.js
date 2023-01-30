import{_ as s,c as n,o as a,a as l}from"./app.d89524ac.js";const m=JSON.parse('{"title":"Redis - 基础","description":"","frontmatter":{},"headers":[{"level":2,"title":"基本","slug":"基本","link":"#基本","children":[{"level":3,"title":"数据结构","slug":"数据结构","link":"#数据结构","children":[]},{"level":3,"title":"数据类型","slug":"数据类型","link":"#数据类型","children":[]}]},{"level":2,"title":"常用命令","slug":"常用命令","link":"#常用命令","children":[{"level":3,"title":"键","slug":"键","link":"#键","children":[]},{"level":3,"title":"字符串","slug":"字符串","link":"#字符串","children":[]},{"level":3,"title":"散列表/哈希","slug":"散列表-哈希","link":"#散列表-哈希","children":[]},{"level":3,"title":"列表","slug":"列表","link":"#列表","children":[]},{"level":3,"title":"集合","slug":"集合","link":"#集合","children":[]},{"level":3,"title":"有序集合","slug":"有序集合","link":"#有序集合","children":[]}]},{"level":2,"title":"持久化","slug":"持久化","link":"#持久化","children":[{"level":3,"title":"RDB","slug":"rdb","link":"#rdb","children":[]},{"level":3,"title":"AOF","slug":"aof","link":"#aof","children":[]},{"level":3,"title":"取舍","slug":"取舍","link":"#取舍","children":[]}]},{"level":2,"title":"主从复制","slug":"主从复制","link":"#主从复制","children":[{"level":3,"title":"优势","slug":"优势","link":"#优势","children":[]}]},{"level":2,"title":"哨兵和集群","slug":"哨兵和集群","link":"#哨兵和集群","children":[{"level":3,"title":"哨兵","slug":"哨兵","link":"#哨兵","children":[]},{"level":3,"title":"集群","slug":"集群","link":"#集群","children":[]}]},{"level":2,"title":"一些理解","slug":"一些理解","link":"#一些理解","children":[{"level":3,"title":"消息处理的触发机制","slug":"消息处理的触发机制","link":"#消息处理的触发机制","children":[]},{"level":3,"title":"案例","slug":"案例","link":"#案例","children":[]}]}],"relativePath":"db/redis-basic.md","lastUpdated":1673517781000}'),e={name:"db/redis-basic.md"},p=l(`<h1 id="redis-基础" tabindex="-1">Redis - 基础 <a class="header-anchor" href="#redis-基础" aria-hidden="true">#</a></h1><h2 id="基本" tabindex="-1">基本 <a class="header-anchor" href="#基本" aria-hidden="true">#</a></h2><h3 id="数据结构" tabindex="-1">数据结构 <a class="header-anchor" href="#数据结构" aria-hidden="true">#</a></h3><ul><li>动态字符串</li><li>整数集合</li><li>压缩列表</li><li>快速链表</li><li>字典</li><li>Stream 流</li></ul><h3 id="数据类型" tabindex="-1">数据类型 <a class="header-anchor" href="#数据类型" aria-hidden="true">#</a></h3><ul><li>字符串</li><li>列表</li><li>字典</li><li>集合+有序集合</li><li>散列表/哈希表</li><li>数据流</li></ul><h2 id="常用命令" tabindex="-1">常用命令 <a class="header-anchor" href="#常用命令" aria-hidden="true">#</a></h2><h3 id="键" tabindex="-1">键 <a class="header-anchor" href="#键" aria-hidden="true">#</a></h3><div class="language-bash line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki"><code><span class="line"><span style="color:#6272A4;"># 查看键类型：none string list set zset hash stream </span></span>
<span class="line"><span style="color:#8BE9FD;">type</span><span style="color:#F8F8F2;"> [key]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 查看键过期时间：单位秒</span></span>
<span class="line"><span style="color:#F8F8F2;">ttl [key]</span></span>
<span class="line"><span style="color:#6272A4;"># 查看键过期时间：单位毫秒</span></span>
<span class="line"><span style="color:#F8F8F2;">pttl [key]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 设置键过期时间：单位秒</span></span>
<span class="line"><span style="color:#F8F8F2;">expire [key] 200</span></span>
<span class="line"><span style="color:#6272A4;"># 删除键的过期时间（使其变为永久有效</span></span>
<span class="line"><span style="color:#F8F8F2;">persist [key]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 重命名键</span></span>
<span class="line"><span style="color:#F8F8F2;">rename [key] [new_key]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 更新 key 的访问时间，避免被 LRU 策略淘汰</span></span>
<span class="line"><span style="color:#F8F8F2;">touch [key……]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 判断键是否存在，返回 key 存在的数量</span></span>
<span class="line"><span style="color:#F8F8F2;">exist [key1 key2 ……]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 查找符合模式的键，并一次性返回，数据量大时容易阻塞服务器</span></span>
<span class="line"><span style="color:#F8F8F2;">keys [pattern]</span></span>
<span class="line"><span style="color:#6272A4;"># 例如：keys *</span></span>
<span class="line"><span style="color:#6272A4;"># keys red?s</span></span>
<span class="line"><span style="color:#6272A4;"># keys red*s</span></span>
<span class="line"><span style="color:#6272A4;"># keys red[ix]s</span></span>
<span class="line"><span style="color:#6272A4;"># keys red\\[s</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 遍历键，不用担心阻塞服务器，未指定 count 参数时默认返回 10 个</span></span>
<span class="line"><span style="color:#F8F8F2;">scan cursor [match_pattern] [count</span><span style="color:#FF79C6;">=</span><span style="color:#F8F8F2;">10]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 随机取键：在当前数据库中随即返回一个尚未过期的 key</span></span>
<span class="line"><span style="color:#F8F8F2;">randomkey</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 删除键：同步删除，可能阻塞服务器</span></span>
<span class="line"><span style="color:#F8F8F2;">del [key……]</span></span>
<span class="line"><span style="color:#6272A4;"># 删除键：异步删除，在另一个线程进行内存回收，不阻塞当前线程</span></span>
<span class="line"><span style="color:#F8F8F2;">unlink [key……]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 序列化键，并返回序列化后的数据</span></span>
<span class="line"><span style="color:#F8F8F2;">dump [key]</span></span>
<span class="line"><span style="color:#6272A4;"># 反序列化：使用 dump 命令序列化后进行反序列化</span></span>
<span class="line"><span style="color:#F8F8F2;">restore [key] [ttl]</span></span>
<span class="line"></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br></div></div><h3 id="字符串" tabindex="-1">字符串 <a class="header-anchor" href="#字符串" aria-hidden="true">#</a></h3><div class="language-bash line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki"><code><span class="line"><span style="color:#6272A4;"># 设置值</span></span>
<span class="line"><span style="color:#8BE9FD;">set</span><span style="color:#F8F8F2;"> [key] [value] [EX ttl]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 批量设置值</span></span>
<span class="line"><span style="color:#F8F8F2;">mset [key value] [key value……]</span></span>
<span class="line"><span style="color:#6272A4;"># 批量获取值</span></span>
<span class="line"><span style="color:#F8F8F2;">mget [key……]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 追加字符串</span></span>
<span class="line"><span style="color:#F8F8F2;">append [key value]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 计数器：将 key 的存储值加一或者减一，不因并发而导致统计出错</span></span>
<span class="line"><span style="color:#F8F8F2;">incr [key]</span></span>
<span class="line"><span style="color:#F8F8F2;">decr [key]</span></span>
<span class="line"><span style="color:#6272A4;"># 以下两个会先检查 key 值是否为整数，不是则失败，存储值增加或减少 increment/decrement 量</span></span>
<span class="line"><span style="color:#F8F8F2;">incrby [key] [increment]</span></span>
<span class="line"><span style="color:#F8F8F2;">decrby [key] [decrement]</span></span>
<span class="line"><span style="color:#6272A4;"># 以下两个会先检查 key 值是否为浮点数，不是则失败，存储值增加或减少 increment/decrement 量</span></span>
<span class="line"><span style="color:#F8F8F2;">incrbyfloat [key] [increment] </span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 获取值</span></span>
<span class="line"><span style="color:#F8F8F2;">get [key]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 获取旧值并设置新值</span></span>
<span class="line"><span style="color:#F8F8F2;">getset [key value]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 截取字符串</span></span>
<span class="line"><span style="color:#F8F8F2;">getrange [key start end]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 获取字符串长度</span></span>
<span class="line"><span style="color:#F8F8F2;">strlen [key]</span></span>
<span class="line"></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br></div></div><h3 id="散列表-哈希" tabindex="-1">散列表/哈希 <a class="header-anchor" href="#散列表-哈希" aria-hidden="true">#</a></h3><div class="language-bash line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki"><code><span class="line"><span style="color:#6272A4;"># 设置值</span></span>
<span class="line"><span style="color:#F8F8F2;">hset [key] [field value]</span></span>
<span class="line"><span style="color:#F8F8F2;">hmset [key] [field1 value1] [field2 value2……]</span></span>
<span class="line"><span style="color:#F8F8F2;">hsetnx [key] [field value]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 判断 key 的 field 是否存在</span></span>
<span class="line"><span style="color:#F8F8F2;">hexists [key] [field]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 获取值</span></span>
<span class="line"><span style="color:#F8F8F2;">hget [key] [field]</span></span>
<span class="line"><span style="color:#F8F8F2;">hmget [key] [field1……]</span></span>
<span class="line"><span style="color:#F8F8F2;">hkeys [key] </span><span style="color:#6272A4;"># 获取指定 key 的全部 field</span></span>
<span class="line"><span style="color:#F8F8F2;">hvals [key] </span><span style="color:#6272A4;"># 获取指定 key 的全部 value</span></span>
<span class="line"><span style="color:#F8F8F2;">hgetall [key] </span><span style="color:#6272A4;"># 获取指定 key 的 field-value 对</span></span>
<span class="line"><span style="color:#F8F8F2;">hlen [key] </span><span style="color:#6272A4;"># 获取指定 key 的 field 总个数</span></span>
<span class="line"><span style="color:#F8F8F2;">hscan [key] [cursor_index] [count</span><span style="color:#FF79C6;">=</span><span style="color:#F8F8F2;">10] </span><span style="color:#6272A4;"># 从指定位置（必须）遍历指定 key 的 count 个 field</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 删除 field （批量）</span></span>
<span class="line"><span style="color:#F8F8F2;">hdel [key] [field……]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 自增</span></span>
<span class="line"><span style="color:#F8F8F2;">hincrby [key] [field] [increment]</span></span>
<span class="line"><span style="color:#F8F8F2;">hincrbyfloat [key] [field] [increment]</span></span>
<span class="line"></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br></div></div><h3 id="列表" tabindex="-1">列表 <a class="header-anchor" href="#列表" aria-hidden="true">#</a></h3><div class="language-bash line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki"><code><span class="line"><span style="color:#6272A4;"># 在列表头部插入元素，如果 key 不存在则创建，返回列表的总长度</span></span>
<span class="line"><span style="color:#F8F8F2;">lpush [key] [value……]</span></span>
<span class="line"><span style="color:#6272A4;"># 在列表尾部插入元素，如果 key 不存在则创建，返回列表的总长度</span></span>
<span class="line"><span style="color:#F8F8F2;">rpush [key] [value……]</span></span>
<span class="line"><span style="color:#6272A4;"># 从列表头部弹出元素，并返回弹出的元素</span></span>
<span class="line"><span style="color:#F8F8F2;">lpop [key]</span></span>
<span class="line"><span style="color:#6272A4;"># 从列表尾部弹出元素，并返回弹出的元素</span></span>
<span class="line"><span style="color:#F8F8F2;">rpop [key]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 获取元素</span></span>
<span class="line"><span style="color:#F8F8F2;">lindex [key] [index]</span></span>
<span class="line"><span style="color:#F8F8F2;">lrange [key] [start end] </span><span style="color:#6272A4;"># -1 表示最后一个元素，-2 表示倒数第二个元素，越界则返回 empty array</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 获取列表长度</span></span>
<span class="line"><span style="color:#F8F8F2;">llen [key]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 设置指定索引位置的元素值</span></span>
<span class="line"><span style="color:#F8F8F2;">lset [key] [index value]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 插入元素：将值 value 插入到列表 key，且位于值 pivot 之前或之后</span></span>
<span class="line"><span style="color:#F8F8F2;">linsert [key] before</span><span style="color:#FF79C6;">|</span><span style="color:#F8F8F2;">after [pivot_value] [value]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 删除元素：移除列表中与 value 相等的 count 个元素，并返回被移除的元素数目</span></span>
<span class="line"><span style="color:#6272A4;"># count 为 0 时表示删除所有与 value 相等的元素，count 为正数时从表头搜索，反之从表尾</span></span>
<span class="line"><span style="color:#F8F8F2;">lrem [key] [count] [value]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 裁剪列表：保留区间内的元素，区间外的元素将被删除</span></span>
<span class="line"><span style="color:#F8F8F2;">ltrim [key] [start end]</span></span>
<span class="line"></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br></div></div><h3 id="集合" tabindex="-1">集合 <a class="header-anchor" href="#集合" aria-hidden="true">#</a></h3><div class="language-bash line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki has-diff"><code><span class="line"><span style="color:#6272A4;"># 集合特点：无序、成员唯一，基于 dict 和 intset</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 添加成员：返回加入成功的个数</span></span>
<span class="line"><span style="color:#F8F8F2;">sadd [key] [member……]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 删除成员：返回删除成功的个数</span></span>
<span class="line"><span style="color:#F8F8F2;">srem [key] [member……]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 获取成员：随机</span></span>
<span class="line"><span style="color:#F8F8F2;">srandmember [key]</span></span>
<span class="line"><span style="color:#6272A4;"># 删除随机成员并返回该成员</span></span>
<span class="line"><span style="color:#F8F8F2;">spop [key] [count</span><span style="color:#FF79C6;">=</span><span style="color:#F8F8F2;">1]</span></span>
<span class="line"><span style="color:#6272A4;"># 获取集合中的所有成员</span></span>
<span class="line"><span style="color:#F8F8F2;">smembers [key]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 查找成员是否存在于集合</span></span>
<span class="line"><span style="color:#F8F8F2;">sismember [key] [member]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 移动成员：将 member 元素从 source 集合移动至 destination 集合</span></span>
<span class="line"><span style="color:#F8F8F2;">smove [source_key] [destination_key] [member]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 获取基数（集合中的元素个数）</span></span>
<span class="line"><span style="color:#F8F8F2;">scard [key]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 增量遍历集合元素：每次执行时返回少量元素和一个新的游标</span></span>
<span class="line"><span style="color:#6272A4;"># 该游标用于下次遍历时延续之前的遍历过程</span></span>
<span class="line"><span style="color:#6272A4;"># 游标为 0 时表示开始一轮新的迭代</span></span>
<span class="line"><span style="color:#F8F8F2;">sscan [cursor] [match_pattern] [count]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 运算：交集</span></span>
<span class="line"><span style="color:#F8F8F2;">sinter [key……]</span></span>
<span class="line"><span style="color:#F8F8F2;">sinterstore [destination_key] [key……] </span><span style="color:#6272A4;"># 求交集并将结果保存至 destination_key</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 运算：并集</span></span>
<span class="line"><span style="color:#F8F8F2;">sunion [key……]</span></span>
<span class="line"><span style="color:#6272A4;"># 运算：差集</span></span>
<span class="line"><span style="color:#F8F8F2;">sdiff [key……]</span></span>
<span class="line"></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br></div></div><h3 id="有序集合" tabindex="-1">有序集合 <a class="header-anchor" href="#有序集合" aria-hidden="true">#</a></h3><div class="language-bash line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki"><code><span class="line"><span style="color:#6272A4;"># 添加</span></span>
<span class="line"><span style="color:#F8F8F2;">zadd [key] [score1 member1] [score2 member2]……</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 删除</span></span>
<span class="line"><span style="color:#F8F8F2;">zrem [key] [member……]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 获取基数（集合元素个数）</span></span>
<span class="line"><span style="color:#F8F8F2;">zcard [key]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 获取 score 值在指定区间内元素的个数</span></span>
<span class="line"><span style="color:#F8F8F2;">zcount [key] [min max]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 成员值自增</span></span>
<span class="line"><span style="color:#F8F8F2;">zincrby [key] [increment] [member]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 获取成员 member 在 按 score 从小到大排序 中的排名</span></span>
<span class="line"><span style="color:#F8F8F2;">zrank [key] [member]</span></span>
<span class="line"><span style="color:#6272A4;"># 获取成员 member 在 按 score 从大到小排序 中的排名</span></span>
<span class="line"><span style="color:#F8F8F2;">zrevrank [key] [member]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 迭代遍历</span></span>
<span class="line"><span style="color:#F8F8F2;">zscan [key] [cursor] [match_pattern] [count]</span></span>
<span class="line"></span>
<span class="line"><span style="color:#6272A4;"># 获取指定区间内的成员，按 score 值递增排序，score 相同时按字典序排序</span></span>
<span class="line"><span style="color:#F8F8F2;">zrange [key] [start end]</span></span>
<span class="line"><span style="color:#6272A4;"># 获取指定区间内的成员，按 score 值递减排序，score 相同时按字典序排序</span></span>
<span class="line"><span style="color:#F8F8F2;">zrevrange [key] [start end]</span></span>
<span class="line"></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br></div></div><h2 id="持久化" tabindex="-1">持久化 <a class="header-anchor" href="#持久化" aria-hidden="true">#</a></h2><p>Redis 有两种持久化方式：一种为 RDB 方式，RDB 保存某一时间点之前的数据；另一种为 AOF 方式，AOF 保存的是 Redis 服务器端执行的每一条命令。</p><h3 id="rdb" tabindex="-1">RDB <a class="header-anchor" href="#rdb" aria-hidden="true">#</a></h3><p>RDB 快照有两种触发方式，其一为通过配置参数，例如在配置文件中写入如下配置：</p><div class="language-ini line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">ini</span><pre class="shiki"><code><span class="line"><span style="color:#F8F8F2;">save 60 1000 </span><span style="color:#6272A4;"># 60 秒内如果有 1000 个 key 发生变化，就会触发一次 RDB 的快照</span></span>
<span class="line"></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><p>其二是通过在客户端执行<code>bgsave</code>命令，显式触发一次 RDB 快照。该函数 fork 一个子进程执行 rdbSave 函数进行实际的快照存储工作，而父进程可以继续处理客户端请求。当子进程退出后，父进程调用相关回调函数进行后续处理。</p><h3 id="aof" tabindex="-1">AOF <a class="header-anchor" href="#aof" aria-hidden="true">#</a></h3><p>AOF 是 Redis 的另一种持久化方式。简单来说，AOF 就是将 Redis 服务端执行过的每一条命令都保存到一个文件，当 Redis 重启时，只要按顺序回放这些命令就会恢复到原始状态。</p><h3 id="取舍" tabindex="-1">取舍 <a class="header-anchor" href="#取舍" aria-hidden="true">#</a></h3><p>RDB 保存的是一个时间点的快照，如果发生故障，丢失的就是从最后一次 RDB 执行的时间点到故障发生的时间间隔内产生的数据。如果 Redis 数据量很大，QPS 很高，那么执行一次 RDB 需要的时间会相应增加，发生故障时丢失的数据也会增多。</p><p>而 AOF 保存的是一条条命令，理论上可以做到发生故障时只丢失一条命令。但是由于操作系统中执行写文件操作代价很大。</p><p>由此可以看出，RDB 保存的是最终的数据，是一个最终状态；而 AOF 保存的是达到这个最终状态的过程。可以通过 Redis 配置参数，通过对安全性和性能的折中，设置不同的策略。</p><h2 id="主从复制" tabindex="-1">主从复制 <a class="header-anchor" href="#主从复制" aria-hidden="true">#</a></h2><p>用户可以通过执行<code>slaveof</code>命令或在配置文件中设置 slaveof 选项来开启主从复制功能。例如现有两台服务器——<code>127.0.0.1:6379</code>和<code>127.0.0.1:7000</code>，向服务器<code>127.0.0.1:6379</code>发送下面命令：</p><div class="language-shell line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki"><code><span class="line"><span style="color:#F8F8F2;">slaveof 127.0.0.1 7000 </span><span style="color:#6272A4;">#当前服务器成为 127.0.0.1:7000 的从服务器</span></span>
<span class="line"></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br></div></div><h3 id="优势" tabindex="-1">优势 <a class="header-anchor" href="#优势" aria-hidden="true">#</a></h3><ul><li>读写分离：单台服务器能支撑的 QPS 是有上限的，通过部署主从服务器，分别处理写、读请求，提升 Redis 的服务能力；并且可以通过复制功能让主服务器免于执行持久化操作：关闭主服务器的持久化，让从服务器去执行持久化操作。</li><li>数据容灾：通过主从复制功能，保持数据同步，提升服务的可靠性。一旦主服务器宕机，可立即切换至从服务器，避免 Redis 服务中断。</li></ul><h2 id="哨兵和集群" tabindex="-1">哨兵和集群 <a class="header-anchor" href="#哨兵和集群" aria-hidden="true">#</a></h2><p>哨兵是 Redis 的高可用方案，可以在 Redis Master 发生故障时自动选择一个 Redis Slave 切换为 Master，继续对外提供服务，保证服务器不出现单点故障。</p><p>集群提供数据自动分片到不同节点的功能，并且当部分节点失效后仍然可以使用。</p><h3 id="哨兵" tabindex="-1">哨兵 <a class="header-anchor" href="#哨兵" aria-hidden="true">#</a></h3><p>实际中至少会部署 3 个哨兵，并且哨兵数量最好是奇数。有以下原因：</p><ol><li>只部署 1 个的话，哨兵本身就成为了一个单点</li><li>哨兵个数为偶数时，可能发生选 leader 时平票的情况</li></ol><h3 id="集群" tabindex="-1">集群 <a class="header-anchor" href="#集群" aria-hidden="true">#</a></h3><p>集群用来提供横向扩展的能力，即当数据量增多时，通过增加服务节点就可以扩展服务能力。背后的理论思想是将数据通过某种算法分布到不同的服务节点，当节点越多时，单台节点所需提供服务的数据就越少。集群解决了以下问题：</p><ol><li>分槽（slot）：即如何决定某条数据应该由哪个节点提供服务 <ol><li>Redis 将键空间分为了 16384 个 slot，并通过指定算法计算出每个 key 所属的 slot</li><li>算法：<code>HASH_SLOT = CRC16(key) mod 16384</code></li></ol></li><li>端向集群发起请求的方式：客户端并不知道某个数据应该由哪个节点提供服务，并且扩容或者节点发生故障后，不应该影响客户端的使用 <ol><li>实际应用中，Redis 客户端可以通过向集群请求 slot 和节点的映射关系并缓存，然后通过本地计算要操作的 key 所属的 slot，查询映射关系，直接向正确的节点发起请求，这样可以获得几乎等价于单节点部署的性能</li></ol></li><li>节点发生故障后，该节点服务的数据的处理方式 <ol><li>当集群由于节点故障或扩容导致重新分片后，客户端先通过重定向获取到数据</li><li>每次发生重定向后，客户端可以将新的映射关系进行缓存，下次仍然可以直接向正确的节点发起请求</li></ol></li><li>扩容：即向集群中添加新节点的方式</li><li>同一条命令需要处理的 key 分布在不同节点时的解决方案 <ol><li>当一条命令需要操作的 key 分属于不同节点时，Redis 会报错</li><li>Redis 提供了一种被称为 hash tags 的机制，由业务方保证，当需要进行多个 key 的处理时，将所有 key 分布到同一个节点，该机制实现原理如下： <ol><li>如果一个 key 包含 {substring} 这种模式，则计算 slot 时只计算 <code>{</code> 和 <code>}</code> 之间的子字符串</li><li>即 <code>keys{sub}1</code>、<code>keys{sub}2</code>、<code>keys{sub}3</code>等计算 slot 时，都会按照 sub 串进行</li><li>这样保证这三个字符串会分布到同一节点</li></ol></li></ol></li></ol><h2 id="一些理解" tabindex="-1">一些理解 <a class="header-anchor" href="#一些理解" aria-hidden="true">#</a></h2><h3 id="消息处理的触发机制" tabindex="-1">消息处理的触发机制 <a class="header-anchor" href="#消息处理的触发机制" aria-hidden="true">#</a></h3><ul><li><p><strong>死循环方式读取处理</strong>：让一个死循环的程序不断地读取一个队列，并且进行后期处理，这种方式失效性是比较强的，因为这种程序不断地扫描消息队列，因此消息队列里一旦有数据，就可以进行后续处理。但是这样会造成服务器压力，最关键的是也不会知道程序什么时候会挂掉，一旦出现故障，没办法及时恢复，这种情况比较适合做秒杀，因为秒杀的时间点比较集中，一旦有秒杀可以立即处理。</p></li><li><p><strong>定时任务</strong>：每隔几秒或者几分钟执行一次，这样做的最大好处就是把压力分开了，无论入队的系统在哪个时间点入队的峰值是多么不平均，但由于出队的系统是定时执行的，所以会把压力均摊，每个时间点的压力会差不太多，所以还是比较流行的，尤其是订单系统和物流配货系统这类的，如订单系统会把写入队列，用户就可以看到我的订单在等物流配货了，这样物流系统就会定时把订单进行汇总处理，这样压力就不会太大，唯一的缺点就是定时和间隔和数量要把握好，不要等上一个定时任务没有执行完呢，下一个定时任务又开始了，这样容易出现不可预测的问题。</p><blockquote><p>守护进程：类似于PHP-FPM和PHP-CGI进程，需要linux的shell基础。</p></blockquote></li></ul><h3 id="案例" tabindex="-1">案例 <a class="header-anchor" href="#案例" aria-hidden="true">#</a></h3><ol><li><p><strong>解耦案例</strong>：队列处理订单系统和配送系统 在网购的时候，提交订单之后，看到自己的订单货物在配送中，这样就参与进来一个系统是配送系统，如果我们在做架构的时候，把订单系统和配送系统设计到一起，就会出现问题。首先对于订单系统来说，订单系统处理压力较大，对于配送系统来说没必要对这些压力做及时反映，我们没必要在订单系统出现问题的情况下，同时配送系统出现问题，这时候就会同时影响两个系统的运转，我们可以解耦解决。这两个系统分开之后，我们可以通过一个队列表来实现两个系统的沟通。首先，订单系统会接收用户的订单，进行订单的处理，会把这些订单写到队列表中，这个队列表是沟通两个系统的关键，由配送系统中的定时执行的程序来读取队列表进行处理，配送系统处理之后，会把已经处理的记录进行标记，这就是流程。</p></li><li><p><strong>流量削峰案例</strong>：Redis 的 List 类型实现秒杀</p><p>为什么要使用 Redis 而不适用 Mysql 呢？</p><p>因为 Redis 是基于内存，速度要快很多，而 Mysql 需要往硬盘里写，因为其他业务还要使用 Mysql，如果秒杀使用 Mysql 的话，会把 Mysql 的资源耗光，这样其他的业务在读取 Mysql 肯定出问题。另外 Redis 对数据有一个持久化作用，这样要比 Memcache 要有优势，并且数据类型要多，这次要用的就是 Redis 的 List，可以向头部或者尾部向 Redis 的链表增加元素，这样 Redis 在实现一个轻量级的队列非常有优势。</p></li></ol>`,50),r=[p];function i(c,o,b,t,u,d){return a(),n("div",null,r)}const F=s(e,[["render",i]]);export{m as __pageData,F as default};
