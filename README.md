# Upload TencentCloud SSL Certificate
上传你的SSL证书到腾讯云SSL证书管理，并自动替换相关CDN的HTTPS证书设置。

## 安装
首先你要有`Node.js`环境，最好是最新版本，因为我也不知道类似v12版本能不能支持
```shell
git clone https://github.com/Jiaocz/upload-tc-certificate.git
cd upload-tc-certificate
npm install
```

## 运行
首次运行请手动运行，命令如下：
```shell
node index.js <cert_path> <key_path> <common_name> <secret_id> <secret_key>
```
**参数解释**


| 参数 | 意思 |
| -- | -- |
| `cert_path` | 存放证书公钥的路径，可以绝对可以相对 |
| `key_path` | 存放证书私钥的路径，可以绝对可以相对|
| `common_name` | 证书的备注，也用于程序判断是否为同一证书，**不通证书请保证此参数不通，否则会产生冲突，也可能会影响CDN的HTTPS |
| `secret_id` | 您的腾讯云API SecretID |
| `secret_key` | 您的腾讯云API SecretKey |

如果您使用子用户来生成API Key，请保证其拥有以下权限，或指定CDN及SSL的全读写权限

<details open>
    <summary>ssl</summary>
    <ul>
        <li>DescribeCertificates</li>
        <li>UploadCertificate</li>
        <li>DeleteCertificate</li>
    </ul>
</details>
<details open>
    <summary>cdn</summary>
    <ul>
        <li>DescribeDomainsConfig</li>
        <li>UpdateDomainConfig</li>
    </ul>
</details>

**首次手动运行后，证书即上传到腾讯云，此时请到CDN处修改需要的域名的HTTPS证书，此后使用相同`common_name`会自动更新替换**

## 示例
例如你是使用[acme.sh](https://acme.sh)生成的泛域名证书，可以直接在`--reloadcmd`中载入命令，以达到续期后自动更新。
```shell
acme.sh --install-cert -d *.your.domain \
--key-file /path/to/privkey.pem         \
--fullchain-file /path/to/fullchain.pem \
--reloadcmd "service nginx reload && node /path/to/script/index.js /path/to/fullchain.pem /path/to/privkey.pem *.your.domain XXXXXXX XXXXXXX > /log/upload-cert.log"
```