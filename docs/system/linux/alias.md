# 常用别名

## 查看近期开机记录
```sh
alias lastreboot='last --time-format=iso reboot | tac'
```

参考来源：[Stack Exchange: Command to check if the machine was rebooted](https://unix.stackexchange.com/questions/747014/command-to-check-if-the-machine-was-rebooted)

## 查看默认出口 IP
```sh
alias outip="ip route get 8.8.8.8 | head -1 | awk '{print \$7}'"
```

参考来源：[Stack Overflow: How to get the primary IP address of the local machine on Linux and OS X?](https://stackoverflow.com/questions/13322485/how-to-get-the-primary-ip-address-of-the-local-machine-on-linux-and-os-x)

## 查看命令速查表
```sh
cht() { curl "http://cheat.sh/$*" } # cheat sheet
```

## IP 地址归属地查询
```sh
ipl() { curl -s "http://ip-api.com/json/$1?lang=zh-CN" | jq } # ip to location
```

## 随机生成指定长度的字母数字组合
```sh
ran() { openssl rand -base64 $(($1*2)) | tr -d '\n=+/' | grep -oP "^[a-zA-Z0-9]{$1}" } # random alphanumeric
```
