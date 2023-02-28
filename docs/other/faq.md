# FAQ - 常见问题答疑


[[TOC]]

### 如何理解控制反转（Ioc）？

控制反转（Inversion of Control，IoC）是一种程序设计模式，它将对象的创建和使用过程交由容器来处理，有助于减少代码耦合度、改进代码可重用性、降低代码复杂性。
IoC 通常会使用**依赖注入**的方式来实现，即将所需要的对象或者服务注入到相应的对象中。

PHP 示例：

```php
class Container
{
    private array $services = [];

    public function register($name, $callback)
    {
        if (is_callable($callback)) {
            $this->services[$name] = $callback;
        } else {
            throw new \RuntimeException('Invalid callback');
        }
    }

    public function get($name)
    {
        if (isset($this->services[$name])) {  // 如果服务存在，则调用回调函数来实例化服务对象并返回结果。
            return call_user_func($this->services[$name]);
        }

        throw new \RuntimeException('Service not found');
    }
}
```

依赖：

```php
class User
{
    private DatabaseInterfece $db;

    public function __construct(DatabaseInterfece $db)
    {
        $this->db = $db;
    }

    public function getUserInfo()
    {
        return $this->db->getUserInfo();
    }
}
```

使用：

```php
// 定义IoC容器
$container = new Container();

// 注册服务
$container->register('db', function () {
    return new MySQL();
});

// 使用服务
$user = new User($container->get('db'));
$info = $user->getUserInfo();

$this->assertIsArray($info);
$this->assertArrayHasKey('name', $info);
```

具体可查看：[#2](https://github.com/SimpleLearnCoding/hyperf-skeleton/pull/2)。
