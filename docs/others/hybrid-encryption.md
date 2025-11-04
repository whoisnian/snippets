# 混合加密
常见的加密算法有对称加密如 AES，非对称加密如 RSA 和 ECC。非对称加密无需预先共享密钥，但加解密速度较慢，且加密后数据量通常会增大，因此实践中常使用混合加密传输数据：
1. 接收方使用非对称加密算法生成一对公私钥，其中公钥可以公开，私钥必须保密
2. 加密方生成一个随机的对称密钥，并使用该对称密钥加密实际数据
3. 加密方使用接收方的公钥加密该对称密钥，并将加密后的对称密钥和加密后的数据一起发送给接收方
4. 接收方使用自己的私钥解密得到对称密钥，再使用该对称密钥解密得到实际数据

注意事项：
* RSA 密钥长度至少应为 2048 位，且密钥长度会限制可加密的原文长度，根据 Go 中 [rsa.EncryptOAEP()](https://pkg.go.dev/crypto/rsa#EncryptOAEP) 的函数说明，使用 2048 位密钥时 RSA-OAEP 最多可加密 256-2*20-2=214 字节的数据
* 在浏览器中使用 Web Crypto API 加密数据时，对称加密算法 AES-CBC 仅支持 PKCS#7 填充方式且无法自定义，非对称加密算法仅支持 RSA-OAEP，且只能在 [安全上下文](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) 中使用

参考来源：
* [Wikipedia: Hybrid cryptosystem](https://en.wikipedia.org/wiki/Hybrid_cryptosystem)
* [MDN: Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
* [Stack Overflow: Node.js Crypto, what's the default padding for AES?](https://stackoverflow.com/questions/50701311/node-js-crypto-whats-the-default-padding-for-aes)
* [Stack Overflow: What padding does window.crypto.subtle.encrypt use for AES-CBC](https://stackoverflow.com/questions/54746103/what-padding-does-window-crypto-subtle-encrypt-use-for-aes-cbc)

## 非对称密钥生成
```sh
openssl genrsa -out rsa_private.pem 2048 # 生成 RSA 私钥
openssl rsa -in rsa_private.pem -pubout -out rsa_public.pem # 从私钥中提取 RSA 公钥
```

## Ruby 加解密示例
```ruby showLineNumbers
require 'openssl'
require 'base64'
require 'json'

RSA_PRIVATE_KEY_PEM = <<~EOF
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCcvaxoGO5vhlzA
l0cWnRNTP8W1rg8zmVrJA3Yv6OSt+tPf0kcXVpGpBrIHofXxiPAY2FnhKLzaHYrA
MBl218JKxV5cqIF9kRgV10CjRQRq419sWq0p8AhjCUELIfGkmJ6go6KaQ/vRqDEr
jzi8mWFi2/7rG8OE2PanNZ516WjFHi7atH1LUCaRNKObQTUfWAnw9UatB/Te5KI9
MrdRv+k7XcayW4osIIfv9L65KxHw44PHsTxQDZhdpAzBQn/DxY+x2OLtLiBo9NG9
C8S8WIQUPQRzXmx7+C/ZUjmgPK0M1PqrOzIln+wKmQBHk6uA7UO24zUzDxjk4jqF
5KAypIppAgMBAAECggEASsDLMPpy/Q1/vvpnFQnk5ZdMm9FfvqQtACF+hGr2ZWNz
GRQYg7Dt10cyMSG1QnSkzbShaRkcuInOWsqV2nAcYbyvvFFBMLm6WvBGC5gm+zNl
ly/H1nB8D3+iXcTakj2XqdVg/2Hc/6jPio7L6GbeY1+4vDiJjxpKyIRyBppDNX7o
kBbjN9k/bmPDQE3z0F1kBv+W791xMPyzZ6678qbh3uJvPrK5L3OUP3EQ7iaIDqfH
TqbFy3vNvwYA4mGuTsZnAl1lxbuoIhzGDrD6p1KameX+hCyF4oxGrrkS3t14EXIx
rx9sKo26IU0x8H1WuRzgpP8n9nrSI0aD2dls7Y9D4QKBgQDL1/EMG5vD+X6WqRwU
6a1027TGXxzN3BVOIgFjOQV+05yTTTRwzAAFQTH6rSGrG9rAqg9UuW/y0dsXaJw+
EEhJvrrhZ3ievWdszxue37gD9D+LDgQ1axm3mP8MZYXL9sACknJhrQKNpOiJFRS+
CzTTtqXAm3fXlWcxPkw48pjTXwKBgQDE2HCX68kpdYwaJfbVIjIuC1QLSLTTJ2Oj
OP0C1hFUA7sOj8rX1ZJLWyzHl3mXq48q2ii3JecF16FiC+aHi5zO4yivZVQn/KFP
3jhowj5UpWQUmmbHWyemOWGk8O6l/jZ90b97quvT0rnPFUc9NutmfBS5isp9R62P
3J4t7O1/NwKBgQCH2eGm/Rthj3yDMi8p7NaSI/6lmivbMorsaJNeKll0PdmC/hgt
+HcnCV0iwJHItKakcnIHOBLY1G1ce3ZtknJq23c207u6p2YvSRQSXO0JjZVvuiap
5zfbeVa5T0vNNCShUjJy0Ff8SGRFP8x0H4nUc0yiQbqr7cE5O1iXN28MpwKBgBRI
fSmaWSsVeq9DFDEYCfWmoy1ae496cpDiEWgWaMiwbbjtZihhUGbFaVLTr+rJ+cGf
oyxkEm8OrgltUn7LCwhibdHM7iQEqxaQvl1FDqkoNazN0CNgqDA/n2kgjma6UCEc
2M9EaHJ2N0E4XxPWseDojjYkMANCvIajZAU1ca93AoGBAILI5+n25djOOj7kh+94
QJ9goKXmDYmGoj9Q7QtpqaiJzFW49Ksq+b5g8sj9mT8VSvCFpB2w9P0xpI6rtNkK
AQQ7dN/EDedy3a4WhFyBYbWi4psoBbaat46ZU60qY4/QTTxvFt3L/2g2XQV1PaJK
GcdSC8Jdq4D6ifVmZ7oN0nfx
-----END PRIVATE KEY-----
EOF

RSA_PUBLIC_KEY_PEM = <<~EOF
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnL2saBjub4ZcwJdHFp0T
Uz/Fta4PM5layQN2L+jkrfrT39JHF1aRqQayB6H18YjwGNhZ4Si82h2KwDAZdtfC
SsVeXKiBfZEYFddAo0UEauNfbFqtKfAIYwlBCyHxpJieoKOimkP70agxK484vJlh
Ytv+6xvDhNj2pzWedeloxR4u2rR9S1AmkTSjm0E1H1gJ8PVGrQf03uSiPTK3Ub/p
O13GsluKLCCH7/S+uSsR8OODx7E8UA2YXaQMwUJ/w8WPsdji7S4gaPTRvQvEvFiE
FD0Ec15se/gv2VI5oDytDNT6qzsyJZ/sCpkAR5OrgO1DtuM1Mw8Y5OI6heSgMqSK
aQIDAQAB
-----END PUBLIC KEY-----
EOF

INPUT = "The quick brown fox jumps over the lazy dog"

RSA_PUBLIC_KEY = OpenSSL::PKey::RSA.new(RSA_PUBLIC_KEY_PEM)
RSA_PRIVATE_KEY = OpenSSL::PKey::RSA.new(RSA_PRIVATE_KEY_PEM)

# public encryption
aes_cipher = OpenSSL::Cipher::AES256.new(:CBC)
aes_cipher.encrypt
aes_key = aes_cipher.random_key
aes_iv = aes_cipher.random_iv
encrypted_data = aes_cipher.update(INPUT) + aes_cipher.final
encrypted_key = RSA_PUBLIC_KEY.public_encrypt(aes_key, OpenSSL::PKey::RSA::PKCS1_OAEP_PADDING)
encrypted_result = JSON.dump({
  encrypted_data: Base64.strict_encode64(encrypted_data),
  encrypted_key:  Base64.strict_encode64(encrypted_key),
  iv:             Base64.strict_encode64(aes_iv)
})

puts "Original  Data: #{INPUT}"
puts "Encrypted Data: #{encrypted_result}"

# private decryption
params = JSON.parse(encrypted_result)
encrypted_data = Base64.decode64(params["encrypted_data"])
encrypted_key = Base64.decode64(params["encrypted_key"])
aes_iv = Base64.decode64(params["iv"])

aes_decipher = OpenSSL::Cipher::AES256.new(:CBC)
aes_decipher.decrypt
aes_decipher.key = RSA_PRIVATE_KEY.private_decrypt(encrypted_key, OpenSSL::PKey::RSA::PKCS1_OAEP_PADDING)
aes_decipher.iv = aes_iv
decrypted_data = aes_decipher.update(encrypted_data) + aes_decipher.final

puts "Decrypted Data: #{decrypted_data}"
```

执行 `ruby hybrid_encryption.rb` 运行该脚本，输出结果类似于：
```
Original  Data: The quick brown fox jumps over the lazy dog
Encrypted Data: {"encrypted_data":"dfh0hI37NtmMSYhr2o0QEkaDOfLVk6qIBDZpdBOvqF2b3Lw9TE3xEsLqvLcvsugO","encrypted_key":"gUwBwput0Q1LMmoUosDDC5l4T8a2VQaEOPOY9ZiHPQi8UEPX7cKihLpl4U2FYdTOGUI5+Qs0DKa9CQYBEn5TwLe38nuqlmd4cxCF0UKOa0MoS4X6XQtRouYw0ngSBaZMQotP6WJGOtBrTsHyLTGGSX67Z0JZRyKzw70SaMfPELpk3Pe/D/Dx12nMFogYExvt1myjB51WeMpDfDYLnDj7y4ZOk0NDv28DIjLlz4yZeSHd4iyEZO78nXH630U2BatwIM2vWU+cxCTjeEfLAh4lcxkq6ZJi8QuBS779pYR7nHtDUorZNCUnfqrC1Ke419RDmxbIJbADrViJR3JZZKo/kA==","iv":"egLjHHOtXR9QheL74vunOQ=="}
Decrypted Data: The quick brown fox jumps over the lazy dog
```

## Node.js 加解密示例
```js showLineNumbers
const crypto = require('crypto')
const process = require('process')

const RSA_PRIVATE_KEY_PEM = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCcvaxoGO5vhlzA
l0cWnRNTP8W1rg8zmVrJA3Yv6OSt+tPf0kcXVpGpBrIHofXxiPAY2FnhKLzaHYrA
MBl218JKxV5cqIF9kRgV10CjRQRq419sWq0p8AhjCUELIfGkmJ6go6KaQ/vRqDEr
jzi8mWFi2/7rG8OE2PanNZ516WjFHi7atH1LUCaRNKObQTUfWAnw9UatB/Te5KI9
MrdRv+k7XcayW4osIIfv9L65KxHw44PHsTxQDZhdpAzBQn/DxY+x2OLtLiBo9NG9
C8S8WIQUPQRzXmx7+C/ZUjmgPK0M1PqrOzIln+wKmQBHk6uA7UO24zUzDxjk4jqF
5KAypIppAgMBAAECggEASsDLMPpy/Q1/vvpnFQnk5ZdMm9FfvqQtACF+hGr2ZWNz
GRQYg7Dt10cyMSG1QnSkzbShaRkcuInOWsqV2nAcYbyvvFFBMLm6WvBGC5gm+zNl
ly/H1nB8D3+iXcTakj2XqdVg/2Hc/6jPio7L6GbeY1+4vDiJjxpKyIRyBppDNX7o
kBbjN9k/bmPDQE3z0F1kBv+W791xMPyzZ6678qbh3uJvPrK5L3OUP3EQ7iaIDqfH
TqbFy3vNvwYA4mGuTsZnAl1lxbuoIhzGDrD6p1KameX+hCyF4oxGrrkS3t14EXIx
rx9sKo26IU0x8H1WuRzgpP8n9nrSI0aD2dls7Y9D4QKBgQDL1/EMG5vD+X6WqRwU
6a1027TGXxzN3BVOIgFjOQV+05yTTTRwzAAFQTH6rSGrG9rAqg9UuW/y0dsXaJw+
EEhJvrrhZ3ievWdszxue37gD9D+LDgQ1axm3mP8MZYXL9sACknJhrQKNpOiJFRS+
CzTTtqXAm3fXlWcxPkw48pjTXwKBgQDE2HCX68kpdYwaJfbVIjIuC1QLSLTTJ2Oj
OP0C1hFUA7sOj8rX1ZJLWyzHl3mXq48q2ii3JecF16FiC+aHi5zO4yivZVQn/KFP
3jhowj5UpWQUmmbHWyemOWGk8O6l/jZ90b97quvT0rnPFUc9NutmfBS5isp9R62P
3J4t7O1/NwKBgQCH2eGm/Rthj3yDMi8p7NaSI/6lmivbMorsaJNeKll0PdmC/hgt
+HcnCV0iwJHItKakcnIHOBLY1G1ce3ZtknJq23c207u6p2YvSRQSXO0JjZVvuiap
5zfbeVa5T0vNNCShUjJy0Ff8SGRFP8x0H4nUc0yiQbqr7cE5O1iXN28MpwKBgBRI
fSmaWSsVeq9DFDEYCfWmoy1ae496cpDiEWgWaMiwbbjtZihhUGbFaVLTr+rJ+cGf
oyxkEm8OrgltUn7LCwhibdHM7iQEqxaQvl1FDqkoNazN0CNgqDA/n2kgjma6UCEc
2M9EaHJ2N0E4XxPWseDojjYkMANCvIajZAU1ca93AoGBAILI5+n25djOOj7kh+94
QJ9goKXmDYmGoj9Q7QtpqaiJzFW49Ksq+b5g8sj9mT8VSvCFpB2w9P0xpI6rtNkK
AQQ7dN/EDedy3a4WhFyBYbWi4psoBbaat46ZU60qY4/QTTxvFt3L/2g2XQV1PaJK
GcdSC8Jdq4D6ifVmZ7oN0nfx
-----END PRIVATE KEY-----`

const RSA_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnL2saBjub4ZcwJdHFp0T
Uz/Fta4PM5layQN2L+jkrfrT39JHF1aRqQayB6H18YjwGNhZ4Si82h2KwDAZdtfC
SsVeXKiBfZEYFddAo0UEauNfbFqtKfAIYwlBCyHxpJieoKOimkP70agxK484vJlh
Ytv+6xvDhNj2pzWedeloxR4u2rR9S1AmkTSjm0E1H1gJ8PVGrQf03uSiPTK3Ub/p
O13GsluKLCCH7/S+uSsR8OODx7E8UA2YXaQMwUJ/w8WPsdji7S4gaPTRvQvEvFiE
FD0Ec15se/gv2VI5oDytDNT6qzsyJZ/sCpkAR5OrgO1DtuM1Mw8Y5OI6heSgMqSK
aQIDAQAB
-----END PUBLIC KEY-----`

const INPUT = "The quick brown fox jumps over the lazy dog"

;(async () => {
  const RSA_PUBLIC_KEY = crypto.createPublicKey(RSA_PUBLIC_KEY_PEM)
  const RSA_PRIVATE_KEY = crypto.createPrivateKey(RSA_PRIVATE_KEY_PEM)

  // public encryption
  const aes_key = crypto.randomBytes(32)
  const aes_iv = crypto.randomBytes(16)
  const aes_cipher = crypto.createCipheriv('aes-256-cbc', aes_key, aes_iv)
  const encrypted_data = Buffer.concat([aes_cipher.update(INPUT), aes_cipher.final()])
  const encrypted_key = crypto.publicEncrypt({key: RSA_PUBLIC_KEY, padding: crypto.constants.PKCS1_OAEP_PADDING}, aes_key)
  const encrypted_result = JSON.stringify({
    encrypted_data: encrypted_data.toString('base64'),
    encrypted_key: encrypted_key.toString('base64'),
    iv: aes_iv.toString('base64')
  })

  console.log(`Original  Data: ${INPUT}`)
  console.log(`Encrypted Data: ${encrypted_result}`)

  // private decryption
  const params = JSON.parse(encrypted_result)
  const encrypted_data_d = Buffer.from(params["encrypted_data"], 'base64')
  const encrypted_key_d = Buffer.from(params["encrypted_key"], 'base64')
  const aes_iv_d = Buffer.from(params["iv"], 'base64')

  const decrypted_key = crypto.privateDecrypt({key: RSA_PRIVATE_KEY, padding: crypto.constants.PKCS1_OAEP_PADDING}, encrypted_key_d)
  const aes_decipher = crypto.createDecipheriv('aes-256-cbc', decrypted_key, aes_iv_d)
  const decryptedData = Buffer.concat([aes_decipher.update(encrypted_data_d), aes_decipher.final()])

  console.log(`Decrypted Data: ${decryptedData.toString()}`)
})()
```

执行 `node hybrid_encryption.js` 运行该脚本，输出结果类似于：
```
Original  Data: The quick brown fox jumps over the lazy dog
Encrypted Data: {"encrypted_data":"jbRZOlFxQC4YYf7PkL0PpNe5+d28ixL5slRnapKSYyZFABKOC0rj/TilSQ2slV/i","encrypted_key":"cyY57TIGQiDUcynpMHir4fUzdVAUUMW30ufH6WkSFUrwFmfA/L5NqILs1zqMGRYe9c3Z5mR3Sl4joxUea4ZV6O7/2IjafZaOLAJFhYoNR/yafVZ8Az9/x/t5fK6xcXQfHxSyYEDPIiI/EP2czc+ssyVme2a+eZeEyzpV+swvBAo1mZqALd0vnWwiBf6l9+uOrWyEPCWSthcW2XkCjfUtobxLZxkHB6OpaQHY0S2rkK3AWkq3nMXTMUI9cRsudqulxA8XTnBh+ZxiERpbjDqvV26IqtoWFLllX1uAFbrlwHycsGKqKUcXKIXjOmvNxpAv6dH417ub6EI2GMgPHUnizQ==","iv":"Kx3NRLRb06ZyB4rJLz9aKA=="}
Decrypted Data: The quick brown fox jumps over the lazy dog
```

## Browser JavaScript 加解密示例
```js showLineNumbers
const RSA_PRIVATE_KEY_PEM = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCcvaxoGO5vhlzA
l0cWnRNTP8W1rg8zmVrJA3Yv6OSt+tPf0kcXVpGpBrIHofXxiPAY2FnhKLzaHYrA
MBl218JKxV5cqIF9kRgV10CjRQRq419sWq0p8AhjCUELIfGkmJ6go6KaQ/vRqDEr
jzi8mWFi2/7rG8OE2PanNZ516WjFHi7atH1LUCaRNKObQTUfWAnw9UatB/Te5KI9
MrdRv+k7XcayW4osIIfv9L65KxHw44PHsTxQDZhdpAzBQn/DxY+x2OLtLiBo9NG9
C8S8WIQUPQRzXmx7+C/ZUjmgPK0M1PqrOzIln+wKmQBHk6uA7UO24zUzDxjk4jqF
5KAypIppAgMBAAECggEASsDLMPpy/Q1/vvpnFQnk5ZdMm9FfvqQtACF+hGr2ZWNz
GRQYg7Dt10cyMSG1QnSkzbShaRkcuInOWsqV2nAcYbyvvFFBMLm6WvBGC5gm+zNl
ly/H1nB8D3+iXcTakj2XqdVg/2Hc/6jPio7L6GbeY1+4vDiJjxpKyIRyBppDNX7o
kBbjN9k/bmPDQE3z0F1kBv+W791xMPyzZ6678qbh3uJvPrK5L3OUP3EQ7iaIDqfH
TqbFy3vNvwYA4mGuTsZnAl1lxbuoIhzGDrD6p1KameX+hCyF4oxGrrkS3t14EXIx
rx9sKo26IU0x8H1WuRzgpP8n9nrSI0aD2dls7Y9D4QKBgQDL1/EMG5vD+X6WqRwU
6a1027TGXxzN3BVOIgFjOQV+05yTTTRwzAAFQTH6rSGrG9rAqg9UuW/y0dsXaJw+
EEhJvrrhZ3ievWdszxue37gD9D+LDgQ1axm3mP8MZYXL9sACknJhrQKNpOiJFRS+
CzTTtqXAm3fXlWcxPkw48pjTXwKBgQDE2HCX68kpdYwaJfbVIjIuC1QLSLTTJ2Oj
OP0C1hFUA7sOj8rX1ZJLWyzHl3mXq48q2ii3JecF16FiC+aHi5zO4yivZVQn/KFP
3jhowj5UpWQUmmbHWyemOWGk8O6l/jZ90b97quvT0rnPFUc9NutmfBS5isp9R62P
3J4t7O1/NwKBgQCH2eGm/Rthj3yDMi8p7NaSI/6lmivbMorsaJNeKll0PdmC/hgt
+HcnCV0iwJHItKakcnIHOBLY1G1ce3ZtknJq23c207u6p2YvSRQSXO0JjZVvuiap
5zfbeVa5T0vNNCShUjJy0Ff8SGRFP8x0H4nUc0yiQbqr7cE5O1iXN28MpwKBgBRI
fSmaWSsVeq9DFDEYCfWmoy1ae496cpDiEWgWaMiwbbjtZihhUGbFaVLTr+rJ+cGf
oyxkEm8OrgltUn7LCwhibdHM7iQEqxaQvl1FDqkoNazN0CNgqDA/n2kgjma6UCEc
2M9EaHJ2N0E4XxPWseDojjYkMANCvIajZAU1ca93AoGBAILI5+n25djOOj7kh+94
QJ9goKXmDYmGoj9Q7QtpqaiJzFW49Ksq+b5g8sj9mT8VSvCFpB2w9P0xpI6rtNkK
AQQ7dN/EDedy3a4WhFyBYbWi4psoBbaat46ZU60qY4/QTTxvFt3L/2g2XQV1PaJK
GcdSC8Jdq4D6ifVmZ7oN0nfx
-----END PRIVATE KEY-----`

const RSA_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnL2saBjub4ZcwJdHFp0T
Uz/Fta4PM5layQN2L+jkrfrT39JHF1aRqQayB6H18YjwGNhZ4Si82h2KwDAZdtfC
SsVeXKiBfZEYFddAo0UEauNfbFqtKfAIYwlBCyHxpJieoKOimkP70agxK484vJlh
Ytv+6xvDhNj2pzWedeloxR4u2rR9S1AmkTSjm0E1H1gJ8PVGrQf03uSiPTK3Ub/p
O13GsluKLCCH7/S+uSsR8OODx7E8UA2YXaQMwUJ/w8WPsdji7S4gaPTRvQvEvFiE
FD0Ec15se/gv2VI5oDytDNT6qzsyJZ/sCpkAR5OrgO1DtuM1Mw8Y5OI6heSgMqSK
aQIDAQAB
-----END PUBLIC KEY-----`

const INPUT = "The quick brown fox jumps over the lazy dog"

;(async () => {
  // parse public key
  const public_pem_header = '-----BEGIN PUBLIC KEY-----'
  const public_pem_footer = '-----END PUBLIC KEY-----'
  const public_pem_contents = RSA_PUBLIC_KEY_PEM.substring(
    public_pem_header.length,
    RSA_PUBLIC_KEY_PEM.length - public_pem_footer.length - 1,
  )
  const rsa_public_bytes = Uint8Array.fromBase64(public_pem_contents) // chrome 140+ || firefox 133+
  const RSA_PUBLIC_KEY = await window.crypto.subtle.importKey('spki', rsa_public_bytes, { name: 'RSA-OAEP', hash: 'SHA-1' }, true, ['encrypt'])

  // parse private key
  const private_pem_header = '-----BEGIN PRIVATE KEY-----'
  const private_pem_footer = '-----END PRIVATE KEY-----'
  const private_pem_contents = RSA_PRIVATE_KEY_PEM.substring(
    private_pem_header.length,
    RSA_PRIVATE_KEY_PEM.length - private_pem_footer.length - 1,
  )
  const rsa_private_bytes = Uint8Array.fromBase64(private_pem_contents) // chrome 140+ || firefox 133+
  const RSA_PRIVATE_KEY = await window.crypto.subtle.importKey('pkcs8', rsa_private_bytes, { name: 'RSA-OAEP', hash: 'SHA-1' }, true, ['decrypt'])

  // public encryption
  const input = new TextEncoder().encode(INPUT)
  const aes_key = await window.crypto.subtle.generateKey({ name: "AES-CBC", length: 256 }, true, ["encrypt", "decrypt"])
  const aes_iv = window.crypto.getRandomValues(new Uint8Array(16))
  const encrypted_data = await window.crypto.subtle.encrypt({ name: "AES-CBC", iv: aes_iv }, aes_key, input)
  const exported_key = await window.crypto.subtle.exportKey("raw", aes_key)
  const encrypted_key = await window.crypto.subtle.encrypt({ name: 'RSA-OAEP' }, RSA_PUBLIC_KEY, exported_key)
  const encrypted_result = JSON.stringify({
    encrypted_data: (new Uint8Array(encrypted_data)).toBase64(),
    encrypted_key: (new Uint8Array(encrypted_key)).toBase64(),
    iv: (new Uint8Array(aes_iv)).toBase64()
  })

  console.log(`Original  Data: ${INPUT}`)
  console.log(`Encrypted Data: ${encrypted_result}`)

  // private decryption
  const params = JSON.parse(encrypted_result)
  const encrypted_data_d = Uint8Array.fromBase64(params["encrypted_data"])
  const encrypted_key_d = Uint8Array.fromBase64(params["encrypted_key"])
  const aes_iv_d = Uint8Array.fromBase64(params["iv"])

  const aes_key_bytes = await window.crypto.subtle.decrypt({ name: 'RSA-OAEP' }, RSA_PRIVATE_KEY, encrypted_key_d)
  const aes_key_d = await window.crypto.subtle.importKey("raw", aes_key_bytes, "AES-CBC", true, ["encrypt", "decrypt"])
  const decrypted_data = await window.crypto.subtle.decrypt({ name: "AES-CBC", iv: aes_iv_d }, aes_key_d, encrypted_data_d)
  const decryptedText = new TextDecoder().decode(decrypted_data)

  console.log(`Decrypted Data: ${decryptedText}`)
})()
```

手动粘贴以上代码到浏览器控制台运行，输出结果类似于：
```
Original  Data: The quick brown fox jumps over the lazy dog
Encrypted Data: {"encrypted_data":"r14FOcrF7+ayqQPEi8j82y56sBEQXVJvQMOh9Nqjj9iyF5TtwzRnqj1TMR/B3WBX","encrypted_key":"iw7rnb016WUZkbYb74r9nDe3c+hMKoVmMyX57NeOkA/C2dkmphxJL7QTCqQtj7h/ZTRqosqlN8BpnWQDBr/A5x8OEx5wEaxafPMLsoJAZqfr7ma73ixxrfGDmN/JVzclS0Da7hA2swcxuowPkRdQkC1NF6EN0e4etX1xtDOK1HgkRiFejaguezfTkagT9tEuem54SEJy2K32bFk3811HB56MaZDuqCUX8kLxJa5Td5HzFXXv058IYIjkbKoNmECtpUlzKU5OfZzg9Y8McbnJ/B/BlE1J9eZfskitSRl+MFDPTE748B13sdivJ/XeHMxeVceCcDqI48wg4rpu4FimwQ==","iv":"Kv4QDqp+oFaeF5t75Ezb/A=="}
Decrypted Data: The quick brown fox jumps over the lazy dog
```

## Go 加解密示例
```go showLineNumbers
package main

import (
	"bytes"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha1"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"fmt"
)

const RSA_PRIVATE_KEY_PEM = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCcvaxoGO5vhlzA
l0cWnRNTP8W1rg8zmVrJA3Yv6OSt+tPf0kcXVpGpBrIHofXxiPAY2FnhKLzaHYrA
MBl218JKxV5cqIF9kRgV10CjRQRq419sWq0p8AhjCUELIfGkmJ6go6KaQ/vRqDEr
jzi8mWFi2/7rG8OE2PanNZ516WjFHi7atH1LUCaRNKObQTUfWAnw9UatB/Te5KI9
MrdRv+k7XcayW4osIIfv9L65KxHw44PHsTxQDZhdpAzBQn/DxY+x2OLtLiBo9NG9
C8S8WIQUPQRzXmx7+C/ZUjmgPK0M1PqrOzIln+wKmQBHk6uA7UO24zUzDxjk4jqF
5KAypIppAgMBAAECggEASsDLMPpy/Q1/vvpnFQnk5ZdMm9FfvqQtACF+hGr2ZWNz
GRQYg7Dt10cyMSG1QnSkzbShaRkcuInOWsqV2nAcYbyvvFFBMLm6WvBGC5gm+zNl
ly/H1nB8D3+iXcTakj2XqdVg/2Hc/6jPio7L6GbeY1+4vDiJjxpKyIRyBppDNX7o
kBbjN9k/bmPDQE3z0F1kBv+W791xMPyzZ6678qbh3uJvPrK5L3OUP3EQ7iaIDqfH
TqbFy3vNvwYA4mGuTsZnAl1lxbuoIhzGDrD6p1KameX+hCyF4oxGrrkS3t14EXIx
rx9sKo26IU0x8H1WuRzgpP8n9nrSI0aD2dls7Y9D4QKBgQDL1/EMG5vD+X6WqRwU
6a1027TGXxzN3BVOIgFjOQV+05yTTTRwzAAFQTH6rSGrG9rAqg9UuW/y0dsXaJw+
EEhJvrrhZ3ievWdszxue37gD9D+LDgQ1axm3mP8MZYXL9sACknJhrQKNpOiJFRS+
CzTTtqXAm3fXlWcxPkw48pjTXwKBgQDE2HCX68kpdYwaJfbVIjIuC1QLSLTTJ2Oj
OP0C1hFUA7sOj8rX1ZJLWyzHl3mXq48q2ii3JecF16FiC+aHi5zO4yivZVQn/KFP
3jhowj5UpWQUmmbHWyemOWGk8O6l/jZ90b97quvT0rnPFUc9NutmfBS5isp9R62P
3J4t7O1/NwKBgQCH2eGm/Rthj3yDMi8p7NaSI/6lmivbMorsaJNeKll0PdmC/hgt
+HcnCV0iwJHItKakcnIHOBLY1G1ce3ZtknJq23c207u6p2YvSRQSXO0JjZVvuiap
5zfbeVa5T0vNNCShUjJy0Ff8SGRFP8x0H4nUc0yiQbqr7cE5O1iXN28MpwKBgBRI
fSmaWSsVeq9DFDEYCfWmoy1ae496cpDiEWgWaMiwbbjtZihhUGbFaVLTr+rJ+cGf
oyxkEm8OrgltUn7LCwhibdHM7iQEqxaQvl1FDqkoNazN0CNgqDA/n2kgjma6UCEc
2M9EaHJ2N0E4XxPWseDojjYkMANCvIajZAU1ca93AoGBAILI5+n25djOOj7kh+94
QJ9goKXmDYmGoj9Q7QtpqaiJzFW49Ksq+b5g8sj9mT8VSvCFpB2w9P0xpI6rtNkK
AQQ7dN/EDedy3a4WhFyBYbWi4psoBbaat46ZU60qY4/QTTxvFt3L/2g2XQV1PaJK
GcdSC8Jdq4D6ifVmZ7oN0nfx
-----END PRIVATE KEY-----`

const RSA_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnL2saBjub4ZcwJdHFp0T
Uz/Fta4PM5layQN2L+jkrfrT39JHF1aRqQayB6H18YjwGNhZ4Si82h2KwDAZdtfC
SsVeXKiBfZEYFddAo0UEauNfbFqtKfAIYwlBCyHxpJieoKOimkP70agxK484vJlh
Ytv+6xvDhNj2pzWedeloxR4u2rR9S1AmkTSjm0E1H1gJ8PVGrQf03uSiPTK3Ub/p
O13GsluKLCCH7/S+uSsR8OODx7E8UA2YXaQMwUJ/w8WPsdji7S4gaPTRvQvEvFiE
FD0Ec15se/gv2VI5oDytDNT6qzsyJZ/sCpkAR5OrgO1DtuM1Mw8Y5OI6heSgMqSK
aQIDAQAB
-----END PUBLIC KEY-----`

const INPUT = "The quick brown fox jumps over the lazy dog"

func main() {
	// parse public key
	publicBlock, _ := pem.Decode([]byte(RSA_PUBLIC_KEY_PEM))
	panicIf(publicBlock == nil, "failed to decode pem public block")
	publicKey, err := x509.ParsePKIXPublicKey(publicBlock.Bytes)
	panicIf(err != nil, err)
	rsaPublicKey, ok := publicKey.(*rsa.PublicKey)
	panicIf(!ok, "not rsa public key")

	// parse private key
	privateBlock, _ := pem.Decode([]byte(RSA_PRIVATE_KEY_PEM))
	panicIf(privateBlock == nil, "failed to decode pem private block")
	privateKey, err := x509.ParsePKCS8PrivateKey(privateBlock.Bytes)
	panicIf(err != nil, err)
	rsaPrivateKey, ok := privateKey.(*rsa.PrivateKey)
	panicIf(!ok, "not rsa private key")

	// public encryption
	aesKey := make([]byte, 32)
	aesIv := make([]byte, 16)
	rand.Read(aesKey)
	rand.Read(aesIv)
	aesCipher, err := aes.NewCipher(aesKey)
	panicIf(err != nil, err)
	aesCBCEncrypter := cipher.NewCBCEncrypter(aesCipher, aesIv)
	paddedInput := pkcs7Pad([]byte(INPUT), aesCipher.BlockSize())
	encryptedData := make([]byte, len(paddedInput))
	aesCBCEncrypter.CryptBlocks(encryptedData, paddedInput)
	encryptedKey, err := rsa.EncryptOAEP(sha1.New(), rand.Reader, rsaPublicKey, aesKey, nil)
	panicIf(err != nil, err)
	encryptedResult, err := json.Marshal(map[string]string{
		"encrypted_data": base64.StdEncoding.EncodeToString(encryptedData),
		"encrypted_key":  base64.StdEncoding.EncodeToString(encryptedKey),
		"iv":             base64.StdEncoding.EncodeToString(aesIv),
	})
	panicIf(err != nil, err)

	fmt.Printf("Original  Data: %s\n", INPUT)
	fmt.Printf("Encrypted Data: %s\n", encryptedResult)

	// private decryption
	params := make(map[string]string)
	err = json.Unmarshal(encryptedResult, &params)
	panicIf(err != nil, err)
	encryptedData, err = base64.StdEncoding.DecodeString(params["encrypted_data"])
	panicIf(err != nil, err)
	encryptedKey, err = base64.StdEncoding.DecodeString(params["encrypted_key"])
	panicIf(err != nil, err)
	aesIv, err = base64.StdEncoding.DecodeString(params["iv"])
	panicIf(err != nil, err)

	aesKey, err = rsa.DecryptOAEP(sha1.New(), rand.Reader, rsaPrivateKey, encryptedKey, nil)
	panicIf(err != nil, err)
	aesCipher, err = aes.NewCipher(aesKey)
	panicIf(err != nil, err)
	aesCBCDecrypter := cipher.NewCBCDecrypter(aesCipher, aesIv)
	decryptedData := make([]byte, len(encryptedData))
	aesCBCDecrypter.CryptBlocks(decryptedData, encryptedData)
	decryptedData = pkcs7Unpad(decryptedData)

	fmt.Printf("Decrypted Data: %s\n", decryptedData)
}

func panicIf(condition bool, v any) {
	if condition {
		panic(v)
	}
}

func pkcs7Pad(data []byte, blockSize int) []byte {
	padding := blockSize - len(data)%blockSize
	padtext := bytes.Repeat([]byte{byte(padding)}, padding)
	return append(data, padtext...)
}

func pkcs7Unpad(data []byte) []byte {
	length := len(data)
	unpadding := int(data[length-1])
	return data[:(length - unpadding)]
}
```

执行 `go run hybrid_encryption.go` 运行该脚本，输出结果类似于：
```
Original  Data: The quick brown fox jumps over the lazy dog
Encrypted Data: {"encrypted_data":"DdwVVz0I15fQA+4iMxz5uC4V8wo/lVUhiUbhJvtXaJBxTopHPfeI9DCAUeIG3BZV","encrypted_key":"UgF2HuncxuNYSp1LL3hCZUz1M1Fy52sXCQ1neKZIhKUkuC4ks3rWA3XetKJ4181vf+Yw/1MwQrzvwApD/UocW7zTXRHrgPaPAC1D7vBwuKEAb0KQ0QFoWGkxMqc8uY9e2xECkykcIX7QbmwPLKGiLis7uCyDt1JsXUJvqRyWaj6IAMpKS60lQjVxhlZpOwDwEKEMKlJSYt91TtzjIFhFmNg9DUK38gh/L6OIspuQsAbPPCXVoDO8wQ/S66Nw4CK+fpohpS1Sc6nf4eozWCIeZM5108DoWV4rcYVws73rsukCUoIY+5RxiaD2mUHBQ0cPrDW2INhNHQa8Gyc9Pv3j7g==","iv":"X6ITCmdmLKzWTkcSlLr+gQ=="}
Decrypted Data: The quick brown fox jumps over the lazy dog
```
