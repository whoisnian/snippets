# OpenSSL

## 常用命令
* 查看本地证书信息 `openssl x509 -in ./whoisnian.com.pem -noout -text`
* 查看远端证书信息 `openssl s_client -servername whoisnian.com -connect whoisnian.com:443 2>/dev/null </dev/null | openssl x509 -noout -text`
* 查看所有系统证书 `openssl storeutl -noout -text -certs /etc/ssl/certs/ca-certificates.crt | grep ' Subject: '`
* 检查一天后证书是否过期 `openssl x509 -in ./whoisnian.com.pem -noout -checkend 86400`

## 文件格式
pem 文件通常是一个 `PRIVATE KEY` 和几个 `CERTIFICATE` 的 block 集合，内容类似于：
```
-----BEGIN PRIVATE KEY-----
...(base64 string)...
-----END PRIVATE KEY-----
-----BEGIN CERTIFICATE-----
...(base64 string)...
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
...(base64 string)...
-----END CERTIFICATE-----
-----BEGIN CERTIFICATE-----
...(base64 string)...
-----END CERTIFICATE-----
```
少数服务会对各 block 之间的相对顺序有要求，通常为：
```
1. Private key
2. End-entity certificate
3. Intermediate certificate
4. Root certificate
```
如果申请到的 SSL 证书为独立的 crt 和 key 文件，且内容为 base64 编码，则可以拼接后作为单个 pem 文件使用，如：  
`cat whoisnian.com.crt whoisnian.com.key > whoisnian.com.pem`

参考来源：
* [Wikipedia: X.509: Sample X.509 certificates](https://en.wikipedia.org/wiki/X.509#Sample_X.509_certificates)
* [Server Fault: How to combine various certificates into single .pem](https://serverfault.com/questions/476576/how-to-combine-various-certificates-into-single-pem)

## 拆分单个 pem 文件
* 拆分私钥：
  ```sh
  openssl pkey -in ./whoisnian.com.pem -outform pem -out privatekey.pem
  ```
* 拆分叶子证书：
  ```sh
  openssl x509 -in ./whoisnian.com.pem -outform pem -out certificate.pem
  ```
* 拆分证书链：
  ```sh
  openssl crl2pkcs7 -nocrl -certfile ./whoisnian.com.pem | openssl pkcs7 -print_certs | grep -Ev '^\s*$|subject|issuer' > certificatechain.pem
  ```

参考来源：[Server Fault: How to split a PEM file](https://serverfault.com/questions/391396/how-to-split-a-pem-file)

## 自签证书
```sh
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -days 365 \
  -subj "/C=US/O=localhost/CN=localhost" \
  -addext "keyUsage=critical,digitalSignature,keyEncipherment" \
  -addext "extendedKeyUsage=critical,serverAuth,clientAuth" \
  -addext "subjectAltName=DNS:localhost,DNS:*.local,IP:127.0.0.1" \
  -out localhost.pem -keyout localhost.key
```

参考来源：[Let's Encrypt: Certificates for localhost](https://letsencrypt.org/docs/certificates-for-localhost/#making-and-trusting-your-own-certificates)

## 自签 CA 签发子证书
```sh
openssl version
# OpenSSL 3.6.0 1 Oct 2025 (Library: OpenSSL 3.6.0 1 Oct 2025)

# ca root cert
openssl genrsa -out ca.key 4096
openssl req -new -x509 -sha256 -key ca.key \
  -subj "/C=US/O=Any Trust Services/CN=ATS Root CA 1" \
  -addext "keyUsage=critical,digitalSignature,keyCertSign,cRLSign" \
  -out ca.pem -days 3650

# app leaf cert
openssl genrsa -out app.key 4096
openssl req -new -key app.key \
  -subj "/C=US/O=localhost/CN=localhost" \
  -addext "keyUsage=critical,digitalSignature,keyEncipherment" \
  -addext "extendedKeyUsage=critical,serverAuth,clientAuth" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1" \
  -out app.csr
openssl x509 -req -in app.csr -CA ca.pem -CAkey ca.key -CAcreateserial -sha256 -out app.pem -days 365 -copy_extensions copyall

# clean
rm app.csr

# ca.key: CA 私钥，必须保密，只在签发子证书时使用
# ca.pem: CA 证书，应当公开，在签发子证书时使用，用户需要手动信任
# ca.srl: CA 已签发序列号，可以保留，避免子证书序列号重复
# app.key: 子证书私钥，必须保密，应用服务器配置 HTTPS 使用
# app.pem: 子证书，可以公开，应用服务器配置 HTTPS 使用
```

注意事项：
* macOS 对证书有[额外要求](https://support.apple.com/en-us/103769)，即使已手动信任自签CA证书，子证书仍需满足相关要求才能通过系统验证
  * RSA 密钥长度至少 2048 位
  * 服务器名称必须包含在 Subject Alternative Name (SAN) 中，CommonName 中的名称不再受信任
  * 证书有效期不能超过 825 天
  * ExtendedKeyUsage 中必须包含 id-kp-serverAuth (OID 1.3.6.1.5.5.7.3.1，即 extendedKeyUsage 中的 serverAuth)

参考来源：
* [OpenSearch: Generating self-signed certificates](https://docs.opensearch.org/latest/security/configuration/generate-certificates/)
* [Apple Support: Requirements for trusted certificates in iOS 13 and macOS 10.15](https://support.apple.com/en-us/103769)
