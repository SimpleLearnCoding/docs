# GitHub REST API 参考

> 参考来源：[REST API](https://docs.github.com/zh/enterprise-cloud@latest/rest/overview/resources-in-the-rest-api?apiVersion=2022-11-28)

可以用来做项目架构文档的参考。 并包括了很多常见模块的说明：

- [身份验证](https://docs.github.com/zh/enterprise-cloud@latest/rest/overview/resources-in-the-rest-api?apiVersion=2022-11-28#authentication)
- [速率限制](https://docs.github.com/zh/enterprise-cloud@latest/rest/overview/resources-in-the-rest-api?apiVersion=2022-11-28#authentication)
- [关于 API 版本控制](https://docs.github.com/zh/enterprise-cloud@latest/rest/overview/api-versions?apiVersion=2022-11-28#about-api-versioning)

> 还有很多内容，最好去看原文档。

## Design

[GitHub OpenAPI](https://docs.github.com/zh/enterprise-cloud@latest/rest/overview/endpoints-available-for-github-apps?apiVersion=2022-11-28)可用于在设计自己的 REST 接口时进行参考。

例如用户相关操作：

- 获取用户订阅列表：`GET /users/{username}/subscriptions`
- 获取用户收藏列表：`GET /users/{username}/starred`
- 某组织（org）的黑名单内用户（被阻止的用户）：`GET /orgs/{org}/blocks`
- 用户所加入的组织：`GET /users/{username}/orgs`
- 创建一个项目：`POST /user/projects`

更多请参考[GitHub OpenAPI](https://docs.github.com/zh/enterprise-cloud@latest/rest/overview/endpoints-available-for-github-apps?apiVersion=2022-11-28)列出的接口。



可以看出其设计语义化来接口，操作主题在前，操作在中间，被操作者在最后。
并且疑似存在类似上下级结构关系，不同主体有着不同的上下级结构。
例如用户与项目，用户为主体时表现为用户加入的项目，项目为主体时表现为项目下的成员。



另外，其主体均使用了**复数形式**进行表示。有些特定的修饰词也可以作为路由的一部分，例如`/branches`为分支列表，`/branches/protected`表示“受保护的分支列表”。



## Others



1. 在翻阅这些API列表时，找到一个`GET /repos/{owner}/{repo}/codespaces/new`的API，其作用为「获取用户使用存储库创建的代码空间的默认属性」。也就是说，GitHub 设计了一个提供给前端界面`创建代码空间`使用的接口，其包含了该界面（或者说**代码空间**这个主体）用到的所有默认属性及其默认值。
2. [`GET /gists/{gist_id}/star`](https://docs.github.com/zh/enterprise-cloud@latest/rest/reference/gists#check-if-a-gist-is-starred)在 GitHub 里表示获取该主体是否被当前登录用户 star，而利用[`PUT /gists/{gist_id}/star`](https://docs.github.com/zh/enterprise-cloud@latest/rest/reference/gists#star-a-gist)来对主体进行 star 操作，DELETE 方法则是取消 star







## Names



以下是一些从中吸纳的主体名称列表：



| Resource             | Comment                        | Description                                                  |
| -------------------- | ------------------------------ | ------------------------------------------------------------ |
| users                | 用户                           |                                                              |
| orgs / organizations | 组织                           |                                                              |
| permissions          | 权限                           |                                                              |
| groups               | 群组                           |                                                              |
| downloads            | 可下载文件                     |                                                              |
| secrets              | 密钥                           |                                                              |
| variables            | 变量                           |                                                              |
| owner                | 拥有者                         |                                                              |
| caches               | 缓存                           |                                                              |
| repositories / repos | 仓库/仓储                      |                                                              |
| environments         | 环境                           |                                                              |
| workflows            | 工作流                         |                                                              |
| jobs                 | 作业，流程作业                 |                                                              |
| events               | 事件                           |                                                              |
| feeds                | 源摘要                         |                                                              |
| subscribers          | 订阅人                         |                                                              |
| starred              | 已收藏                         |                                                              |
| installations        | 安装                           |                                                              |
| app                  | 应用                           |                                                              |
| billing              | 账单，计费                     |                                                              |
| branches             | 分支                           |                                                              |
| teams                | 团队                           |                                                              |
| alerts               | 警告/警报                      |                                                              |
| instances            | 实例                           |                                                              |
| analyses             | 分析                           |                                                              |
| databases            | 数据库                         |                                                              |
| languages            | 语言                           |                                                              |
| collaborators        | 协作者                         |                                                              |
| invitations          | 邀请                           | 在GitHub这里，表现为“可邀请的xxx”，xxx由 invitations 前的主体决定。<br>例如：`/repos/{owner}/{repo}/invitations`为「所有当前打开的存储库邀请」 |
| comments             | 注释，评论                     |                                                              |
| statuses             | 状态                           |                                                              |
| snapshots            | 快照                           |                                                              |
| keys                 | 密钥                           |                                                              |
| deployments          | 部署                           |                                                              |
| policies             | 策略                           |                                                              |
| emojis               | Emoji                          |                                                              |
| blobs                | 二进制大对象                   | Git Blob（二进制大对象）是用于将每个文件的内容存储在仓库中的对象类型，文件的 SHA-1 哈希在 Blob 对象中计算和存储。 |
| tags                 | 标记                           |                                                              |
| refs                 | 引用                           |                                                              |
| templates            | 模板                           |                                                              |
| interactions         | 交互                           |                                                              |
| assignees            | 代理人                         | 类似管理员                                                   |
| contributors         | 建设者                         | 有贡献的人                                                   |
| collaborators        | 合作者                         |                                                              |
| authors              | 作者                           |                                                              |
| issues               | 问题、议题                     |                                                              |
| labels               | 标签                           |                                                              |
| milestones           | 里程碑                         |                                                              |
| licenses             | 许可证                         |                                                              |
| versions             | 版本                           |                                                              |
| meta                 | 元数据                         |                                                              |
| profile              | 配置文件，资料                 |                                                              |
| metrics              | 指标                           |                                                              |
| traffic              | 趋势                           | 一般指24小时、一周内、14天内某统计指标的变化趋势             |
| stats                | 统计信息                       |                                                              |
| views                | 浏览、访问                     |                                                              |
| blocks               | 被阻止的人，黑名单，无权限的人 |                                                              |
| members              | 成员                           |                                                              |
| membership           | 成员资格、成员状态             |                                                              |
| reviews              | 审查                           |                                                              |
| dismissals           | 驳回                           |                                                              |
| discussions          | 讨论                           |                                                              |
| assets               | 资源，资产                     |                                                              |
| releases             | 发行，发布                     |                                                              |
| dispatches           | 事件分发                       |                                                              |
| forks                | 分叉                           |                                                              |
| topics               | 主题                           |                                                              |
| followers            | 粉丝                           |                                                              |
| following            | 正在关注的人                   |                                                              |
| attempts             | 重试                           |                                                              |
| usage                | 使用情况                       |                                                              |
| logs                 | 日志                           |                                                              |
| runners              | 运行器                         |                                                              |
| stargazers           | 观星者，对当前主体标星的人     |                                                              |
| notifications        | 通知                           |                                                              |
| packages             | 包，库                         |                                                              |
| marketplace          | 应用市场                       |                                                              |
| deliveries           | 交付                           |                                                              |


