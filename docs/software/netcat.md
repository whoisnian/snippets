# netcat
netcat 的常见实现有 OpenBSD 和 GNU 两种，参数及行为并不完全相同，以下示例均基于更常见的 OpenBSD 版本  
其中 GNU 版本在 2004 年后就未发布过新版本，Arch Linux 于 2025 年 9 月将其[从官方仓库移除](https://gitlab.archlinux.org/archlinux/packaging/packages/gnu-netcat/-/issues/1)  
部分发行版如 [Arch Linux](https://archlinux.org/packages/extra/x86_64/openbsd-netcat/) 和 [Alpine Linux](https://pkgs.alpinelinux.org/package/edge/main/x86_64/netcat-openbsd) 会将 Debian 维护的 [netcat-openbsd](https://salsa.debian.org/debian/netcat-openbsd) 作为上游进行打包  

参考来源：
* [Wikipedia: netcat](https://en.wikipedia.org/wiki/Netcat)
* [AUR: gnu-netcat](https://aur.archlinux.org/packages/gnu-netcat)

## 模拟 HTTP 协议返回固定响应
```sh
(
  while true; do
    echo -e "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 5\r\nConnection: close\r\n\r\nhello" | nc -l -p 8080;
  done
)
```

## 模拟 HTTP 协议返回文件内容
```sh
echo -e "HTTP/1.1 200 OK\r\nContent-Type: image/png\r\nContent-Length: $(stat -c%s nyancat.png)\r\nConnection: close\r\n\r\n$(cat nyancat.png)" | nc -N -l -p 8080
```

## TCP 传输文件
```sh
# 接收方
nc -l 12345 > dir.tar

# 发送方
tar -cO ./Directory | nc -N RECEIVER_HOST 12345
```
