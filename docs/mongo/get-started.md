# Learning MongoDB

> 参考文档：
>
> - [MongoDB CRUD Operations](https://www.mongodb.com/docs/manual/crud/#mongodb-crud-operations)
> - [MongoDB 查询操作符](https://www.mongodb.com/docs/manual/reference/operator/query/)
> - [MongoDB 支持的方法](https://www.mongodb.com/docs/v6.0/reference/method/)


## Docker Start



### Run



```bash
# 后台运行：默认创建 admin 数据库的权限
$ docker run -itd --rm --name mongo \
	-p "27017:27017" \
	-e MONGO_INITDB_ROOT_USERNAME="linnzh" \
    -e MONGO_INITDB_ROOT_PASSWORD="linnzh@1996" \
    -v "$PWD/mongo/data":/data \
    mongo:6

# 临时运行：默认创建 admin 数据库的权限
# 出现错误：MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
# 必须先存在一个实例，然后才可以使用 mongosh 连接
# 即一个 docker 进入 shell 不可以
$ docker run -it --rm \
	-p "27018:27017" \
	-e MONGO_INITDB_ROOT_USERNAME="linnzh" \
    -e MONGO_INITDB_ROOT_PASSWORD="linnzh@1996" \
    -v "$PWD/mongo/tmp":/data \
    mongo:6 \
    mongosh --port 27017 \
    -u "linnzh" -p "linnzh@1996" \
    --authenticationDatabase "admin"

```



### Enter



```sh
# 使用 mongosh 连接数据库 admin

# mongosh admin
Current Mongosh Log ID: 63b788e2be72c0702b8a1fbb
Connecting to:          mongodb://127.0.0.1:27017/admin?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.6.1
Using MongoDB:          6.0.3
Using Mongosh:          1.6.1

For mongosh info see: https://docs.mongodb.com/mongodb-shell/

# 查看所有的数据库：show dbs
admin> show dbs
MongoServerError: command listDatabases requires authentication

# 使用用户 linnzh 连接当前数据库，获取权限
admin> db.auth('linnzh', 'linnzh@1996')
{ ok: 1 }

# 查看所有的数据库：show dbs
admin> show dbs
admin   100.00 KiB
config   12.00 KiB
local    72.00 KiB
```

### Connection



```bash
# 以下命令默认已连接数据库

# 查看当前数据库
$ db
admin

# 可通过 use dbName 命令切换至指定数据库
# 如不存在则创建（但由于没有任何数据，属于“实际上不存在”，不会在 show dbs 命令中显示）
$ use noexist
switched to db noexist
# 由于没有任何数据，属于“实际上不存在”，刚创建的 db 不会在 show dbs 命令中显示
$ show dbs
admin   100.00 KiB
config   72.00 KiB
local    72.00 KiB

# 创建一个 JavaScript 对象
$ movie = {
	title: "test",
	year: 2022
}
{ title: 'test', year: 2022 }

# 将刚才的对象保存至当前数据库的 movies 集合
$ db.movies.insertOne(movie)
{
  acknowledged: true,
  insertedId: ObjectId("63b797eedc6a8bde6f10050c")
}

# 此时 noexist 有了数据，可以在 show dbs 中看到
$ show dbs
admin    100.00 KiB
config    72.00 KiB
local     72.00 KiB
noexist    8.00 KiB
```

## Example



用户（User）可在论坛（Forum）发布帖子（Post），任何用户均可对帖子进行以下操作：

- 点赞（Like）
- 收藏（Favorite）
- 评论（Comment）
- 回复评论（Reply）
- 举报（Abort）

即一个帖子可能拥有以下信息：

```js
post = {
    id: 1,
    title: "Post Title",
    content: "Post content.",
    post_at: "2023-01-01 12:00:00",
    user: {
        id: 1,
        username: "Linnzh",
        avatar: "https://mongo.example.com/avatar/linnzh.png"
    },
    like_num: 100,
    comment_num: 200,
    abort_num: 2,
    likes: [
        {
            user_id: 1,
            created_at: "2023-01-01 12:00:01"
        },
        {
            user_id: 2,
            created_at: "2023-01-01 12:00:02"
        }
    ],
    comments: [
        {
            user_id: 1,
            created_at: "2023-01-01 12:00:01",
            content: "Comment content.",
            comments: [
                {
                    user_id: 1,
                    created_at: "2023-01-01 12:00:01",
                    content: "Comment content.",
                    comments: []
                }
            ]
        }
    ],
    aborts: [
        {
            user_id: 1,
            created_at: "2023-01-01 12:00:01",
            reason: "Against the law"
        },
        {
            user_id: 2,
            created_at: "2023-01-01 12:00:02",
            reason: "Bloody Violence"
        }
    ]
}
```



### Case 1 用户基本信息

<br>

#### 创建用户



`db.user.insertMany([])`



如下：

```js
db.users.insertMany([
    {
        _id: 1,
        username: "Linnzh",
        birth_year: 1996,
        birth_day: "1996-09-08",
        avatar: "https://mongo.example.com/avatar/linnzh.png",
        gender: 1,
        register_time: "2023-01-01 00:00:00",
        register_channel: "Nartual",
        mobile: "18890901111"
    },
    {
        _id: 2,
        username: "Tom",
        birth_year: 1993,
        birth_day: "1993-09-08",
        avatar: "https://mongo.example.com/avatar/tom.png",
        gender: 2,
        register_time: "2023-01-02 00:00:00",
        register_channel: "Facebook",
        mobile: "18890902222"
    },
    {
        _id: 3,
        username: "Bob",
        birth_year: 1997,
        birth_day: "1997-09-08",
        avatar: "https://mongo.example.com/avatar/bob.png",
        gender: 2,
        register_time: "2023-01-03 00:00:00",
        register_channel: "Ins",
        mobile: "18890903333"
    }
])
```



#### 更新用户信息



1. 添加 gender 属性，并根据 gender_desc 的值

```js
db.users.updateMany(
    {gender: 2},
    {
        $set: {
            gender_desc: "男",
        }
    }
)

db.users.updateMany(
    {gender: 1},
    {
        $set: {
            gender_desc: "女",
        }
    }
)
```



#### 获取用户列表



```js
db.users.count()

db.users.find({}).limit(10).pretty()

// 筛选性别
db.users.find({gender: 1}).limit(10).pretty()
```



#### 删除指定用户



```js

// 删除 ID 为 1 的用户
db.users.deleteOne({_id: 1})

```



### Case 2 用户发布帖子

<br>

#### 向指定用户添加一个 posts 属性承载其发布的所有帖子



```js
db.users.insertOne(
    {
        _id: 1,
        username: "Linnzh",
        birth_year: 1996,
        birth_day: "1996-09-08",
        avatar: "https://mongo.example.com/avatar/linnzh.png",
        gender: 1,
        register_time: "2023-01-01 00:00:00",
        register_channel: "Nartual",
        mobile: "18890901111"
    }
)


// 添加 posts 属性
db.users.updateMany(
    {},
    {
        $set: {
            posts: []
        }
    }
)

/**
 * 向 Id 为 1 的用户的 posts 属性中添加一条记录
 *
 * $push.collectionName.elements
 */
db.users.updateOne(
    { _id: 1 },
    {
        $push: {
            posts: {
                _id: 1,
                title: "Post Title",
                content: "Post content.",
                post_at: "2023-01-01 12:00:00"
            }
        }
    }
)

/**
 * 该用户随后又发布了两条帖子
 *
 * $push.collectionName.$each.elements
 */
db.users.updateOne(
    { _id: 1 },
    {
        $push: {
            posts: {
                $each: [
                    {
                        _id: 2,
                        title: "Post Title 2",
                        content: "Post content.",
                        post_at: "2023-01-01 13:00:00"
                    },
                    {
                        _id: 3,
                        title: "Post Title 3",
                        content: "Post content.",
                        post_at: "2023-01-01 14:00:00"
                    }
                ]
            }
        }
    }
)

/**
 * 查看该用户发布的帖子
 * 数组格式
 */
db.users.find({_id: 1}, {posts: 1}).limit(1).pretty()
```



#### 多个用户对某个帖子进行了点赞



此举将更新帖子的点赞数：


```js
db.users.updateOne(
    {_id: 1},
    {
        $inc: {
            "posts.$[elem].likes": 1
        }
    },
    {
        arrayFilters: [
            {
                "elem._id": 1
            }
        ]
    }
)
```


如果要在本帖中查询当前用户是否点赞，可记录一个「点赞文档」：


```js
db.users.likes.insertOne({
    post: 1,
    user: 1
})

// 查询时检查符合条件的数量即可
db.users.likes.find({post: 1, user: 1}, {_id: 1}).count()
```



##### Idea 2



或者是把用户点赞过的帖子ID收集在 users 中：


```js
// 点赞一个帖子
db.users.updateOne(
	{_id: 1},
    {
        $push: {
            like_posts: 1
        }
    }
)

/**
 * 	继续点赞
 */
db.users.updateOne(
	{_id: 1},
    {
        $push: {
            like_posts: {
                $each: [2, 3]
            }
        }
    }
)
```


如果要在本帖中查询当前用户是否点赞，则直接查询点赞的帖子ID是否存在即可：


```js
/**
 * 这里使用了 $in 查询操作
 * @link https://www.mongodb.com/docs/manual/reference/operator/query/in/
 */
db.users.find(
	{
        _id: 1,
        like_posts: {
            $in: [1]
        }
    }
).count() == 1
```
