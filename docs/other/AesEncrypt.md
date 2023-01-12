# AES 加解密算法



> 参考：
>
> - [PHP - openssl_get_cipher_methods](https://www.php.net/manual/en/function.openssl-get-cipher-methods)
> - [AES五种加密模式（CBC、ECB、CTR、OCF、CFB）](https://www.cnblogs.com/starwolf/p/3365834.html)
> - [AES加密(3)：AES加密模式与填充](https://zhuanlan.zhihu.com/p/131324301)



## 概述



**AES**，高级加密标准（英语：Advanced Encryption Standard，缩写：AES），**仅指分段为128 位的`Rijndeal`算法**，是美国联邦政府采用的一种区块加密标准。这个标准用来替代原先的DES，已经被多方分析且广为全世界所使用。AES的**区块长度固定为 128 比特**，密钥长度则可以是 128，192 或 256 比特。AES 算法包括以下加密模式：

1. **电码本模式（Electronic Codebook Book，ECB）**

   基础加密方式，该模式是将整个明文分成若干段相同的小段（不足时补齐），然后对每一小段进行加密，最后组合输出密文。传输错误时一般只影响当前块。

   ECB模式有一个显著的安全问题：如果使用相同的密钥，那么相同的明文块就会生成相同的密文块，不能很好的隐藏数据模式。

2. **密码分组链接模式（Cipher Block Chaining，CBC）**

   该模式是先将明文切分成若干小段（不足时补齐），然后**每一小段与初始块或者上一段的密文段进行异或运算**后（循环模式），再与密钥进行加密，该模式要求在第一个密码块运算时加入一个非空的初始化向量，相比于 ECB 模式增加了破解难度。适合传输长度长的报文，是SSL、IPSec的标准。

   该模式有一个缺点：加密过程是串行的，不能并行化，速度比较慢，但是解密可以并行。另外，如果密文的某一位被修改了，只会使这个密文块所对应的明文块完全改变并且改变下一个明文块的对应位，安全性仍然有一定的欠缺。

3. **计算器模式（Counter，CTR）**

   该模式并不常见，在`CTR`模式中， 有一个自增的算子，这个算子用密钥加密之后的输出和明文异或的结果得到密文，相当于一次一密。这种加密方式简单快速，安全可靠，而且可以并行加密，但是在计算器不能维持很长的情况下，密钥只能使用一次。

4. **密码反馈模式（Cipher FeedBack，CFB）**

   该模式同明文不同密文，分组密钥转换为流密码，但串行运算不利并行，传输错误可能导致后续传输块错误。

5. **输出反馈模式（Output FeedBack，OFB）**

   （类似 CFB）该模式同明文不同密文，分组密钥转换为流密码，但串行运算不利并行，传输错误可能导致后续传输块错误。



在 PHP 的 OPENSSL 扩展中，已对 AES 加密算法进行封装，具体可参考[PHP - openssl_encrypt](https://www.php.net/manual/zh/function.openssl-encrypt.php)，该方法以指定的方式和 key 加密数据，返回原始或 base64 编码后的字符串。

以上算法中，只有 ECB 和 CBC 模式需要进行数据填充（Padding），常见的填充方法有以下六种：

- `NoPadding`：不填充，缺点就是只能加密长为128bits倍数的信息，一般不会使用
- `PKCS5`：缺几个字节就填几个缺的字节数（如果当前数据已经是128bits的倍数了也得要填充，否则无法解密）
  - 严格来讲`PKCS5`在 AES 中是不可以使用的，**因为 AES 的块大小是 16 bytes而 PKCS5 只能用于 8 bytes**，通常我们在 AES 中所说的`PKCS5`指的就是`PKCS7`
  - 例如缺了 4 个字节，那么会使用类似`04 04 04`这样的数据来进行填充
- `PKCS7`：同 PKCS5。但`PKCS5`限定了块大小为 8 bytes 而`PKCS7`没有限定
- `ISO 10126`：最后一个字节是填充的字节数（包括最后一字节），其他全部填随机数
- `ANSI X9.23`：跟ISO 10126很像，只不过ANSI X9.23其他字节填的都是0而不是随机数
- `ZerosPadding`：全部填充`0x00`，无论缺多少全部填充`0x00`，已经是128bits倍数仍要填充



根据数据安全性、稳定性，这里我们仅选择`AES-CBC`模式进行数据的加解密操作，并使用`PKCS7`方式进行填充。

因为 AES 区块长度固定为 128 比特，其**<u>初始化向量 iv 的长度应该至少为 16 位</u>**（128 / 8 = 16，超出部分将被截断）。



密钥长度可选择 128、192 和 256，其中 AES-256 比另外两个要多一个加密步骤，因此这里**选择使用 256 长度密钥**。即最终我们选择的加密算法为`AES-256-CBC`。



### 初始化向量问题

因 CBC 模式需要一个初始化向量来进行加密和解密。为数据传输安全考虑，我们建议使用一个**随机初始向量 iv**来进行加密，请根据使用的编程语言版本自动生成该向量。

由于解密需要用到加密时使用的`iv`，为数据传输双方沟通便利，这里暂定以下方案：

1. 确定 iv 长度为 16 位
2. 数据 message 加密后，在加密后的文本前，拼接上使用的 16 位加密 iv，并对其进行 Base64 编码，最终加密文本 ciphertext
3. 获取数据 ciphertext 后，对其进行 Base64 解码，截取解码后的前 16 位作为解密 iv，并对截取后的文本进行解密

> 该方案参考了 Union Bank 关于支付接口的数据传输加密方法。



### 密码算法说明



- 算法（Algorithm）：AES-256-CBC
- 区块长度（Block Size）：128 bits
- 密钥长度（Key Size）：256 bits
- 加密模式（Mode）：CBC
- 填充方式（Padding）：PKCS7
- 随机初始化向量（Random IV）：Yes



数据安全方案如下：

1. 确定 iv 长度为 16 位
2. 数据 message 加密后，在加密后的文本前，拼接上使用的 16 位加密 iv，并对其进行 Base64 编码，最终加密文本 ciphertext
3. 获取数据 ciphertext 后，对其进行 Base64 解码，截取解码后的前 16 位作为解密 iv，并对截取后的文本进行解密



#### 更多说明

- 随机初始化向量应在每次请求时生成



## 算法实现 - PHP 版本



> ⚠️ 以下实现仅适用于 PHP 大于 7.2 的版本！
>
> ⚠️ 该实现为 PHP 8.0+ 版本，更低版本请随版本进行调整！



```php
<?php


namespace Linnzh\Util;

/**
 * AES 算法 - 默认支持 CBC 算法（并推荐使用）
 *
 * openssl_encrypt 和 openssl_decrypt 的第三个参数是options，它有着很重要的作用：
 *
 * 0：默认模式，自动进行 pkcs7 补位，同时自动进行 base64 编码
 *
 * 1：OPENSSL_RAW_DATA，自动进行 pkcs7 补位， 但是不自动进行 base64 编码
 *
 * 2：OPENSSL_ZERO_PADDING，需要自己进行 pkcs7 补位，同时自动进行 base64 编码
 *
 * ======================================================================
 *
 * 在 openssl 版本里的 AES-256-CBC 方法对应 mcrypt 版本里的 AES-128-CBC
 *
 * ======================================================================
 *
 * @link https://www.php.net/manual/en/function.openssl-get-cipher-methods
 * @see \HyperfTest\Util\AesTest
 */
class Aes
{
    protected int $ivlen = 16;

    /**
     *
     * @param int    $withIvLen
     * @param string $cipher
     * @param int    $options
     *
     * @example new Aes(cipher: 'aes-128-ecb')
     * @example new Aes(cipher: 'aes-192-ecb')
     * @example new Aes(cipher: 'aes-256-ecb')
     * @example new Aes(cipher: 'aes-128-cbc')
     * @example new Aes(cipher: 'aes-192-cbc')
     * @example new Aes(cipher: 'aes-256-cbc')
     */
    public function __construct(public int $withIvLen = 16, protected string $cipher = 'aes-256-cbc', public int $options = OPENSSL_RAW_DATA)
    {
        $this->setCipher($cipher);
        $this->ivlen = openssl_cipher_iv_length(strtoupper($this->cipher));
    }

    /**
     * 加密
     *
     * @param string $message
     * @param string $key
     * @param string $iv
     *
     * @return string
     */
    public function encrypt(string $message, string $key, string $iv)
    {
        if (empty($iv)) {
            throw new \ParseError('The initialization vector is not allowed to be empty!');
        }

        $iv = substr($iv, 0, $this->ivlen);

        try {
            $ciphertext = openssl_encrypt($message, $this->cipher, $key, $this->options, $iv);
            // 携带 iv
            $ciphertext = $iv . $ciphertext;

            if ($this->options == OPENSSL_RAW_DATA) {
                $ciphertext = base64_encode($ciphertext);
            }

            return $ciphertext;
        } catch (\Throwable $e) {
            // throw new \ParseError('Encrypt failed!');
        }

        throw new \ParseError('Encrypt failed!');
    }

    /**
     * 解密
     *
     * @param string $ciphertext
     * @param string $key
     *
     * @return string
     */
    public function decrypt(string $ciphertext, string $key)
    {
        if ($this->options == OPENSSL_RAW_DATA) {
            $ciphertext = base64_decode($ciphertext);
        }

        $iv = substr($ciphertext, 0, $this->withIvLen);
        $ciphertext = substr($ciphertext, $this->withIvLen);

        try {
            return openssl_decrypt($ciphertext, $this->cipher, $key, $this->options, $iv);
        } catch (\Throwable $e) {
        }

        throw new \ParseError('Decrypt failed!');
    }

    private function setCipher(string $cipher)
    {
        if (!in_array($cipher, [
            'aes-128-ecb',
            'aes-192-ecb',
            'aes-256-ecb',
            'aes-128-cbc',
            'aes-192-cbc',
            'aes-256-cbc',
        ], true)) {
            throw new \UnexpectedValueException('Unsupported encryption algorithm!');
        }
        $this->cipher = $cipher;
    }
}
```



### Usage



> 以下代码为 PHPUnit 测试代码，使用方式可参考测试。



```php
<?php

namespace HyperfTest\Util;

use Linnzh\Util\Aes;
use PHPUnit\Framework\TestCase;

class AesTest extends TestCase
{
    private string $key = '47a35de1-0d65-ae63-910d-66d29e4a1e4d';
    private string $message = '{"nickname":"Linnzh","bank_name":"MHO","bank_number":"5472631838918653473","username":"粥粥粥哇"}';
    private string $ciphertext = 'TURFeU16UTFOamM0T1E9PS0L2Zys9HQwCYUKbQTiExOMymAi1lWvsPHN4rNSciI3j1zOWCk9PQKJpf0BSIRMtatZf9J0v1BUbAjHinoGwc8JqQ82HIusqknBsThcVomTIaMfi/2Vk6dqF7JXvlMHtEdjzrcB5NFaqZd5cYFWIq0=';
    private Aes $crypto;
    private int $withIvLen = 16;
    private string $iv = 'MDEyMzQ1Njc4OQ==';

    protected function setUp(): void
    {
        $this->crypto = new Aes(withIvLen: $this->withIvLen, cipher: 'aes-256-cbc', options: OPENSSL_RAW_DATA);
    }

    public function testUnsupportedException()
    {
        $this->expectException(\UnexpectedValueException::class);
        new Aes(cipher: 'aes-256-ctr');
    }

    public function testParseErrorWithEmptyIv()
    {
        $this->expectException(\ParseError::class);
        $this->crypto->encrypt($this->message, $this->key, '');
    }

    public function testEncrypt()
    {
        $ciphertext = $this->crypto->encrypt($this->message, $this->key, $this->iv);
        $this->assertNotFalse($ciphertext, '加密失败！');
        $this->assertEquals($this->ciphertext, $ciphertext, '加密不符合预期');
    }

    public function testDecrypt()
    {
        $message = $this->crypto->decrypt($this->ciphertext, $this->key);
        $this->assertNotFalse($message, '解密失败！');
        $this->assertEquals($this->message, $message, '解密不符合预期');
    }
}
```
